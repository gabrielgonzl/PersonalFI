import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
  {
    // Identificación
    name: {
      type: String,
      required: [true, 'El nombre de la cartera es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },

    // Jerarquía de portfolios (portfolios pueden contener otros portfolios)
    parentPortfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      default: null,
      index: true,
    },

    // Información financiera
    cashBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El balance de efectivo no puede ser negativo'],
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
      maxlength: 3,
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: [0, 'El total invertido no puede ser negativo'],
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, 'El valor actual no puede ser negativo'],
    },
    totalValue: {
      type: Number,
      default: 0,
      min: [0, 'El valor total no puede ser negativo'],
    },

    // Métricas
    profitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },

    // Configuración de distribución objetivo (opcional)
    targetAllocation: [
      {
        assetId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Asset',
        },
        percentage: {
          type: Number,
          min: [0, 'El porcentaje no puede ser negativo'],
          max: [100, 'El porcentaje no puede exceder 100'],
        },
      },
    ],

    // Visual
    color: {
      type: String,
      default: '#10B981',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser formato hexadecimal válido'],
    },
    icon: {
      type: String,
      maxlength: 200,
    },

    // Estado
    isActive: {
      type: Boolean,
      default: true,
    },

    // Fechas
    lastRebalanceDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
PortfolioSchema.index({ isActive: 1 });
PortfolioSchema.index({ createdAt: -1 });

// Virtual: obtener assets del portfolio
PortfolioSchema.virtual('assets', {
  ref: 'Asset',
  localField: '_id',
  foreignField: 'portfolioId',
});

// Virtual: contar assets
PortfolioSchema.virtual('assetCount', {
  ref: 'Asset',
  localField: '_id',
  foreignField: 'portfolioId',
  count: true,
});

// Middleware pre-save: calcular métricas
PortfolioSchema.pre('save', function (next) {
  // Calcular valor total (efectivo + valor de activos)
  this.totalValue = this.cashBalance + this.currentValue;

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

// Método de instancia: validar distribución objetivo
PortfolioSchema.methods.validateTargetAllocation = function () {
  if (!this.targetAllocation || this.targetAllocation.length === 0) {
    return { isValid: true, message: 'No target allocation defined' };
  }

  const totalPercentage = this.targetAllocation.reduce((sum, item) => sum + item.percentage, 0);

  if (Math.abs(totalPercentage - 100) > 0.01) {
    // Tolerancia de 0.01%
    return {
      isValid: false,
      message: `Target allocation must sum to 100%, currently: ${totalPercentage.toFixed(2)}%`,
    };
  }

  return { isValid: true, message: 'Target allocation is valid' };
};

// Método de instancia: agregar efectivo
PortfolioSchema.methods.addCash = async function (amount) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  this.cashBalance += amount;
  return this.save();
};

// Método de instancia: reducir efectivo
PortfolioSchema.methods.reduceCash = async function (amount) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (this.cashBalance < amount) {
    throw new Error('Insufficient cash balance');
  }

  this.cashBalance -= amount;
  return this.save();
};

// Método estático: recalcular métricas desde assets
PortfolioSchema.statics.recalculateMetrics = async function (portfolioId) {
  const Asset = mongoose.model('Asset');

  const assets = await Asset.find({ portfolioId });

  const totalInvested = assets.reduce((sum, asset) => sum + asset.totalInvested, 0);
  const currentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  return { totalInvested, currentValue };
};

// Método estático: obtener distribución actual
PortfolioSchema.statics.getAllocation = async function (portfolioId) {
  const Asset = mongoose.model('Asset');

  const portfolio = await this.findById(portfolioId);
  if (!portfolio) {
    throw new Error('Portfolio not found');
  }

  const assets = await Asset.find({ portfolioId });

  const allocation = assets.map((asset) => ({
    assetId: asset._id,
    assetName: asset.name,
    symbol: asset.symbol,
    type: asset.type,
    value: asset.currentValue,
    percentage: portfolio.totalValue > 0 ? (asset.currentValue / portfolio.totalValue) * 100 : 0,
  }));

  // Agregar efectivo
  if (portfolio.cashBalance > 0) {
    allocation.push({
      type: 'cash',
      assetName: 'Efectivo',
      value: portfolio.cashBalance,
      percentage: portfolio.totalValue > 0 ? (portfolio.cashBalance / portfolio.totalValue) * 100 : 0,
    });
  }

  return {
    portfolioId: portfolio._id,
    totalValue: portfolio.totalValue,
    allocation: allocation.sort((a, b) => b.value - a.value),
  };
};

// Método estático: obtener portfolios con métricas
PortfolioSchema.statics.getAllWithMetrics = async function (includeInactive = false) {
  const query = includeInactive ? {} : { isActive: true };

  const portfolios = await this.find(query).sort({ createdAt: -1 });

  const Asset = mongoose.model('Asset');

  const portfoliosWithMetrics = await Promise.all(
    portfolios.map(async (portfolio) => {
      const assetCount = await Asset.countDocuments({ portfolioId: portfolio._id });

      return {
        ...portfolio.toObject(),
        assetCount,
      };
    })
  );

  return portfoliosWithMetrics;
};

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export default Portfolio;
