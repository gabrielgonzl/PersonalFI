import mongoose from 'mongoose';

/**
 * Modelo para índices de referencia (S&P 500, EUROSTOXX 50, etc.)
 */
const BenchmarkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['stocks', 'bonds', 'crypto', 'commodities', 'mixed', 'other'],
      default: 'stocks',
    },
    region: {
      type: String,
      enum: ['us', 'europe', 'asia', 'global', 'emerging', 'other'],
      default: 'global',
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Metadata para API externa
    externalId: {
      type: String,
      trim: true,
    },
    dataSource: {
      type: String,
      enum: ['yahoo', 'alphavantage', 'manual'],
      default: 'yahoo',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Obtener benchmarks activos
 */
BenchmarkSchema.statics.getActive = async function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

/**
 * Obtener benchmark por símbolo
 */
BenchmarkSchema.statics.getBySymbol = async function (symbol) {
  return this.findOne({ symbol: symbol.toUpperCase(), isActive: true });
};

/**
 * Obtener benchmarks por categoría
 */
BenchmarkSchema.statics.getByCategory = async function (category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

const Benchmark = mongoose.model('Benchmark', BenchmarkSchema);

export default Benchmark;
