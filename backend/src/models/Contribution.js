import mongoose from 'mongoose';
import { CONTRIBUTION_TYPES } from '../config/constants.js';

const ContributionSchema = new mongoose.Schema(
  {
    // Relación con Asset
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'El asset ID es requerido'],
      index: true,
    },

    // Datos de transacción
    date: {
      type: Date,
      required: [true, 'La fecha es requerida'],
      index: true,
      validate: {
        validator: function (value) {
          // No permitir fechas futuras
          return value <= new Date();
        },
        message: 'La fecha no puede ser futura',
      },
    },
    type: {
      type: String,
      required: [true, 'El tipo de transacción es requerido'],
      enum: {
        values: Object.values(CONTRIBUTION_TYPES),
        message: '{VALUE} no es un tipo válido',
      },
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es requerida'],
      min: [0.000001, 'La cantidad debe ser mayor a 0'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'El precio por unidad es requerido'],
      min: [0, 'El precio por unidad no puede ser negativo'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'El monto total no puede ser negativo'],
    },

    // Costos adicionales
    fees: {
      type: Number,
      default: 0,
      min: [0, 'Las comisiones no pueden ser negativas'],
    },

    // Metadata
    notes: {
      type: String,
      maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    },
    source: {
      type: String,
      maxlength: [100, 'El origen no puede exceder 100 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Índices compuestos
ContributionSchema.index({ assetId: 1, date: -1 });
ContributionSchema.index({ date: -1 });
ContributionSchema.index({ type: 1 });

// Middleware pre-save: calcular totalAmount si campos relacionados cambian
ContributionSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('pricePerUnit') || this.isModified('fees')) {
    this.totalAmount = this.quantity * this.pricePerUnit + (this.fees || 0);
  }
  next();
});

// Método estático: obtener total invertido en un asset
ContributionSchema.statics.getTotalInvested = async function (assetId) {
  const result = await this.aggregate([
    { $match: { assetId: new mongoose.Types.ObjectId(assetId) } },
    {
      $group: {
        _id: null,
        totalBought: {
          $sum: {
            $cond: [{ $eq: ['$type', CONTRIBUTION_TYPES.BUY] }, '$totalAmount', 0],
          },
        },
        totalSold: {
          $sum: {
            $cond: [{ $eq: ['$type', CONTRIBUTION_TYPES.SELL] }, '$totalAmount', 0],
          },
        },
        totalQuantityBought: {
          $sum: {
            $cond: [{ $eq: ['$type', CONTRIBUTION_TYPES.BUY] }, '$quantity', 0],
          },
        },
        totalQuantitySold: {
          $sum: {
            $cond: [{ $eq: ['$type', CONTRIBUTION_TYPES.SELL] }, '$quantity', 0],
          },
        },
        totalFees: { $sum: '$fees' },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalBought: 0,
      totalSold: 0,
      totalQuantityBought: 0,
      totalQuantitySold: 0,
      totalQuantity: 0,
      netInvested: 0,
      totalFees: 0,
    };
  }

  const data = result[0];
  return {
    totalBought: data.totalBought,
    totalSold: data.totalSold,
    totalQuantityBought: data.totalQuantityBought,
    totalQuantitySold: data.totalQuantitySold,
    totalQuantity: data.totalQuantityBought - data.totalQuantitySold,
    netInvested: data.totalBought - data.totalSold,
    totalFees: data.totalFees,
  };
};

// Método estático: obtener contribuciones por rango de fechas
ContributionSchema.statics.getByDateRange = function (startDate, endDate, filters = {}) {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    ...filters,
  };

  return this.find(query).populate('assetId', 'name symbol type').sort({ date: -1 });
};

// Método estático: obtener estadísticas de contribuciones
ContributionSchema.statics.getStats = async function (filters = {}) {
  const result = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalFees: { $sum: '$fees' },
      },
    },
  ]);

  return result;
};

// Método estático: obtener timeline de inversiones (agrupado por mes)
ContributionSchema.statics.getMonthlyTimeline = async function (assetId = null) {
  const matchStage = assetId ? { assetId: new mongoose.Types.ObjectId(assetId) } : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        totalBought: {
          $sum: {
            $cond: [{ $eq: ['$type', CONTRIBUTION_TYPES.BUY] }, '$totalAmount', 0],
          },
        },
        totalSold: {
          $sum: {
            $cond: [{ $eq: ['$type', CONTRIBUTION_TYPES.SELL] }, '$totalAmount', 0],
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        totalBought: 1,
        totalSold: 1,
        netInvested: { $subtract: ['$totalBought', '$totalSold'] },
        count: 1,
      },
    },
  ]);
};

const Contribution = mongoose.model('Contribution', ContributionSchema);

export default Contribution;
