import mongoose from 'mongoose';

/**
 * Modelo para almacenar historial de precios de activos
 * Soporta datos OHLCV (Open, High, Low, Close, Volume)
 */
const PriceHistorySchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // Precios OHLC para análisis técnico
    open: {
      type: Number,
      required: true,
      min: 0,
    },
    high: {
      type: Number,
      required: true,
      min: 0,
    },
    low: {
      type: Number,
      required: true,
      min: 0,
    },
    close: {
      type: Number,
      required: true,
      min: 0,
    },
    // Volumen de trading
    volume: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Metadata
    source: {
      type: String,
      enum: ['manual', 'yahoo', 'coingecko', 'alphavantage', 'api'],
      default: 'manual',
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'EUR',
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes por asset y rango de fechas
PriceHistorySchema.index({ assetId: 1, date: -1 });
PriceHistorySchema.index({ date: -1 });

/**
 * Obtener precio de cierre para una fecha específica
 * Si no existe, busca el precio más cercano anterior
 */
PriceHistorySchema.statics.getPriceAtDate = async function (assetId, date) {
  const price = await this.findOne({
    assetId,
    date: { $lte: date },
  })
    .sort({ date: -1 })
    .limit(1);

  return price ? price.close : null;
};

/**
 * Obtener historial de precios en un rango de fechas
 */
PriceHistorySchema.statics.getPriceRange = async function (assetId, startDate, endDate) {
  return this.find({
    assetId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });
};

/**
 * Obtener último precio conocido
 */
PriceHistorySchema.statics.getLatestPrice = async function (assetId) {
  const latest = await this.findOne({ assetId }).sort({ date: -1 }).limit(1);
  return latest ? latest.close : null;
};

/**
 * Agregar precios por granularidad (día, semana, mes, año)
 */
PriceHistorySchema.statics.aggregateByGranularity = async function (assetId, startDate, endDate, granularity = 'day') {
  // Mapeo de granularidad a operador de MongoDB
  const dateFormat = {
    day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
    week: {
      $dateToString: {
        format: '%Y-W%V',
        date: '$date',
      },
    },
    month: { $dateToString: { format: '%Y-%m', date: '$date' } },
    year: { $dateToString: { format: '%Y', date: '$date' } },
  };

  const groupFormat = dateFormat[granularity] || dateFormat.day;

  const pipeline = [
    {
      $match: {
        assetId: new mongoose.Types.ObjectId(assetId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $sort: { date: 1 },
    },
    {
      $group: {
        _id: groupFormat,
        date: { $first: '$date' },
        open: { $first: '$open' },
        high: { $max: '$high' },
        low: { $min: '$low' },
        close: { $last: '$close' },
        volume: { $sum: '$volume' },
      },
    },
    {
      $sort: { date: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

/**
 * Calcular retornos diarios
 */
PriceHistorySchema.statics.calculateReturns = async function (assetId, startDate, endDate) {
  const prices = await this.find({
    assetId,
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1 })
    .select('date close');

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
    returns.push({
      date: prices[i].date,
      return: dailyReturn,
      price: prices[i].close,
    });
  }

  return returns;
};

/**
 * Bulk insert optimizado para grandes cantidades de datos
 */
PriceHistorySchema.statics.bulkInsertPrices = async function (pricesArray) {
  if (!pricesArray || pricesArray.length === 0) return;

  // Usar bulkWrite para mejor performance
  const operations = pricesArray.map((price) => ({
    updateOne: {
      filter: {
        assetId: price.assetId,
        date: price.date,
      },
      update: { $set: price },
      upsert: true,
    },
  }));

  return this.bulkWrite(operations);
};

const PriceHistory = mongoose.model('PriceHistory', PriceHistorySchema);

export default PriceHistory;
