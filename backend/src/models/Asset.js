import mongoose from 'mongoose';
import { ASSET_TYPES } from '../config/constants.js';

const AssetSchema = new mongoose.Schema(
  {
    // Identificación básica
    name: {
      type: String,
      required: [true, 'El nombre del activo es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    symbol: {
      type: String,
      required: [true, 'El símbolo es requerido'],
      uppercase: true,
      trim: true,
      maxlength: [20, 'El símbolo no puede exceder 20 caracteres'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'El tipo de activo es requerido'],
      enum: {
        values: Object.values(ASSET_TYPES),
        message: '{VALUE} no es un tipo válido',
      },
      index: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
      maxlength: 3,
    },

    // Datos financieros
    totalInvested: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El total invertido no puede ser negativo'],
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, 'El valor actual no puede ser negativo'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'La cantidad no puede ser negativa'],
    },
    averagePrice: {
      type: Number,
      default: 0,
      min: [0, 'El precio promedio no puede ser negativo'],
    },
    currentPrice: {
      type: Number,
      default: 0,
      min: [0, 'El precio actual no puede ser negativo'],
    },

    // Métricas calculadas
    profitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },

    // Relación con Portfolio
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      default: null,
      index: true,
    },

    // Metadata
    notes: {
      type: String,
      maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    },
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser formato hexadecimal válido'],
    },
    icon: {
      type: String,
      maxlength: 200,
    },

    // Timestamps
    lastPriceUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compuestos para mejorar performance
AssetSchema.index({ portfolioId: 1, type: 1 });
AssetSchema.index({ createdAt: -1 });

// Virtual para obtener contribuciones del asset
AssetSchema.virtual('contributions', {
  ref: 'Contribution',
  localField: '_id',
  foreignField: 'assetId',
});

// Middleware pre-save: calcular métricas automáticamente
AssetSchema.pre('save', function (next) {
  // Calcular precio promedio
  if (this.quantity > 0) {
    this.averagePrice = this.totalInvested / this.quantity;
  } else {
    this.averagePrice = 0;
  }

  // Calcular valor actual
  this.currentValue = this.quantity * this.currentPrice;

  // Calcular ganancia/pérdida
  this.profitLoss = this.currentValue - this.totalInvested;

  // Calcular porcentaje
  if (this.totalInvested > 0) {
    this.profitLossPercentage = (this.profitLoss / this.totalInvested) * 100;
  } else {
    this.profitLossPercentage = 0;
  }

  next();
});

// Método de instancia: actualizar precio
AssetSchema.methods.updatePrice = async function (newPrice) {
  this.currentPrice = newPrice;
  this.lastPriceUpdate = new Date();
  return this.save();
};

// Método estático: buscar por tipo
AssetSchema.statics.findByType = function (type) {
  return this.find({ type });
};

// Método estático: buscar por portfolio
AssetSchema.statics.findByPortfolio = function (portfolioId) {
  return this.find({ portfolioId });
};

// Método estático: obtener totales globales
AssetSchema.statics.getGlobalTotals = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalInvested: { $sum: '$totalInvested' },
        totalValue: { $sum: '$currentValue' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return { totalInvested: 0, totalValue: 0, count: 0, profitLoss: 0, profitLossPercentage: 0 };
  }

  const totals = result[0];
  totals.profitLoss = totals.totalValue - totals.totalInvested;
  totals.profitLossPercentage =
    totals.totalInvested > 0 ? (totals.profitLoss / totals.totalInvested) * 100 : 0;

  return totals;
};

// Método estático: obtener distribución por tipo
AssetSchema.statics.getDistributionByType = async function () {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalInvested: { $sum: '$totalInvested' },
        totalValue: { $sum: '$currentValue' },
      },
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalInvested: 1,
        totalValue: 1,
        profitLoss: { $subtract: ['$totalValue', '$totalInvested'] },
        profitLossPercentage: {
          $cond: [
            { $eq: ['$totalInvested', 0] },
            0,
            { $multiply: [{ $divide: [{ $subtract: ['$totalValue', '$totalInvested'] }, '$totalInvested'] }, 100] },
          ],
        },
      },
    },
    {
      $sort: { totalValue: -1 },
    },
  ]);
};

const Asset = mongoose.model('Asset', AssetSchema);

export default Asset;
