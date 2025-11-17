/**
 * Servicio para benchmarking y comparación con índices de mercado
 */
import { Benchmark, PriceHistory, Asset } from '../models/index.js';
import priceHistoryService from './priceHistoryService.js';
import {
  calculateBeta,
  calculateAlpha,
  calculateCorrelation,
  calculateRiskMetrics,
} from '../utils/calculations.js';
import { subMonths, subYears } from 'date-fns';

class BenchmarkService {
  /**
   * Inicializar benchmarks predeterminados
   */
  async initializeDefaultBenchmarks() {
    const defaultBenchmarks = [
      {
        name: 'S&P 500',
        symbol: 'SPY',
        description: 'Índice de las 500 mayores empresas de EE.UU.',
        category: 'stocks',
        region: 'us',
        currency: 'USD',
        externalId: '^GSPC',
        dataSource: 'yahoo',
      },
      {
        name: 'EURO STOXX 50',
        symbol: 'SX5E',
        description: 'Índice de las 50 mayores empresas de la Eurozona',
        category: 'stocks',
        region: 'europe',
        currency: 'EUR',
        externalId: '^STOXX50E',
        dataSource: 'yahoo',
      },
      {
        name: 'MSCI World',
        symbol: 'URTH',
        description: 'Índice global de mercados desarrollados',
        category: 'stocks',
        region: 'global',
        currency: 'USD',
        externalId: 'URTH',
        dataSource: 'yahoo',
      },
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        description: 'Bitcoin como benchmark crypto',
        category: 'crypto',
        region: 'global',
        currency: 'USD',
        externalId: 'bitcoin',
        dataSource: 'coingecko',
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        description: 'Ethereum como benchmark crypto',
        category: 'crypto',
        region: 'global',
        currency: 'USD',
        externalId: 'ethereum',
        dataSource: 'coingecko',
      },
    ];

    const results = [];

    for (const benchmarkData of defaultBenchmarks) {
      try {
        // Usar upsert para evitar duplicados
        const benchmark = await Benchmark.findOneAndUpdate(
          { symbol: benchmarkData.symbol },
          benchmarkData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        results.push({ success: true, benchmark: benchmark.name });
      } catch (error) {
        results.push({ success: false, symbol: benchmarkData.symbol, error: error.message });
      }
    }

    return results;
  }

  /**
   * Comparar portfolio con benchmark
   */
  async compareWithBenchmark(benchmarkSymbol, startDate, endDate) {
    const benchmark = await Benchmark.getBySymbol(benchmarkSymbol);

    if (!benchmark) {
      throw new Error(`Benchmark ${benchmarkSymbol} not found`);
    }

    // Obtener precios del benchmark
    const benchmarkPrices = await PriceHistory.find({
      assetId: benchmark._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Si no hay datos históricos, generar sintéticos o retornar vacío
    if (benchmarkPrices.length === 0) {
      console.log(`No price history for benchmark ${benchmarkSymbol}, generating synthetic data...`);
      // Generar precios sintéticos para el benchmark
      await this.generateSyntheticBenchmarkPrices(benchmark._id, startDate, endDate);

      // Reintentamos obtener los precios
      const retryPrices = await PriceHistory.find({
        assetId: benchmark._id,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      if (retryPrices.length === 0) {
        return {
          benchmark: benchmark.name,
          symbol: benchmarkSymbol,
          data: [],
        };
      }

      return {
        benchmark: benchmark.name,
        symbol: benchmarkSymbol,
        data: retryPrices.map((p) => ({
          date: p.date,
          value: p.close,
        })),
      };
    }

    // Calcular returns del benchmark
    const benchmarkReturns = [];
    for (let i = 1; i < benchmarkPrices.length; i++) {
      const ret = (benchmarkPrices[i].close - benchmarkPrices[i - 1].close) / benchmarkPrices[i - 1].close;
      benchmarkReturns.push(ret);
    }

    return {
      benchmark: benchmark.name,
      symbol: benchmarkSymbol,
      data: benchmarkPrices.map((p) => ({
        date: p.date,
        value: p.close,
      })),
      returns: benchmarkReturns,
    };
  }

  /**
   * Generar precios sintéticos para benchmark
   * (Similar a assets pero con volatilidad específica de índices)
   */
  async generateSyntheticBenchmarkPrices(benchmarkId, startDate, endDate) {
    const benchmark = await Benchmark.findById(benchmarkId);
    if (!benchmark) {
      throw new Error('Benchmark not found');
    }

    // Volatilidades típicas de benchmarks
    const volatilityMap = {
      SPY: 0.01, // 1% diario
      SX5E: 0.012, // 1.2% diario
      URTH: 0.01, // 1% diario
      BTC: 0.03, // 3% diario
      ETH: 0.035, // 3.5% diario
    };

    const volatility = volatilityMap[benchmark.symbol] || 0.01;

    // Precio inicial (típico para cada índice)
    const initialPriceMap = {
      SPY: 450,
      SX5E: 4200,
      URTH: 120,
      BTC: 40000,
      ETH: 2500,
    };

    let currentPrice = initialPriceMap[benchmark.symbol] || 100;

    const prices = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Random walk con drift positivo (mercados tienden a subir en el largo plazo)
      const drift = 0.0003; // ~7.5% anual
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const change = drift + randomChange;

      const open = currentPrice;
      const newPrice = currentPrice * (1 + change);
      const high = Math.max(open, newPrice) * 1.005;
      const low = Math.min(open, newPrice) * 0.995;

      prices.push({
        assetId: benchmarkId,
        date: new Date(d),
        open,
        high,
        low,
        close: newPrice,
        volume: 0,
        source: 'synthetic',
        currency: benchmark.currency,
      });

      currentPrice = newPrice;
    }

    if (prices.length > 0) {
      await PriceHistory.bulkInsertPrices(prices);
    }

    return prices;
  }

  /**
   * Calcular métricas vs benchmark
   */
  async calculateBenchmarkMetrics(portfolioReturns, benchmarkSymbol, startDate, endDate) {
    const benchmarkData = await this.compareWithBenchmark(benchmarkSymbol, startDate, endDate);

    if (!benchmarkData.returns || benchmarkData.returns.length === 0) {
      return {
        benchmark: benchmarkData.benchmark,
        beta: 1.0,
        alpha: 0,
        correlation: 0,
        outperformance: 0,
      };
    }

    // Calcular métricas
    const beta = calculateBeta(portfolioReturns, benchmarkData.returns);
    const correlation = calculateCorrelation(portfolioReturns, benchmarkData.returns);

    // Calcular retornos totales
    const portfolioTotalReturn =
      portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length * 252 * 100;
    const benchmarkTotalReturn =
      benchmarkData.returns.reduce((sum, r) => sum + r, 0) / benchmarkData.returns.length * 252 * 100;

    const riskFreeRate = 3; // 3% anual
    const alpha = calculateAlpha(portfolioTotalReturn, riskFreeRate, benchmarkTotalReturn, beta);

    const outperformance = portfolioTotalReturn - benchmarkTotalReturn;

    return {
      benchmark: benchmarkData.benchmark,
      symbol: benchmarkSymbol,
      beta,
      alpha,
      correlation,
      portfolioReturn: Number(portfolioTotalReturn.toFixed(2)),
      benchmarkReturn: Number(benchmarkTotalReturn.toFixed(2)),
      outperformance: Number(outperformance.toFixed(2)),
    };
  }

  /**
   * Obtener todos los benchmarks activos
   */
  async getActiveBenchmarks() {
    return Benchmark.getActive();
  }

  /**
   * Obtener benchmarks por categoría
   */
  async getBenchmarksByCategory(category) {
    return Benchmark.getByCategory(category);
  }

  /**
   * Comparar portfolio con múltiples benchmarks
   */
  async compareWithMultipleBenchmarks(portfolioReturns, startDate, endDate) {
    const benchmarks = await this.getActiveBenchmarks();

    const comparisons = [];

    for (const benchmark of benchmarks) {
      try {
        const metrics = await this.calculateBenchmarkMetrics(
          portfolioReturns,
          benchmark.symbol,
          startDate,
          endDate
        );
        comparisons.push(metrics);
      } catch (error) {
        console.error(`Error comparing with ${benchmark.symbol}:`, error.message);
      }
    }

    return comparisons;
  }

  /**
   * Obtener benchmark recomendado según assets del portfolio
   */
  async getRecommendedBenchmark(assets) {
    if (!assets || assets.length === 0) {
      return { symbol: 'SPY', name: 'S&P 500', reason: 'Default benchmark' };
    }

    // Contar assets por tipo
    const typeCounts = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {});

    // Determinar tipo dominante
    const dominantType = Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b
    );

    // Mapeo de tipos a benchmarks
    const typeToBenchmark = {
      crypto: 'BTC',
      stock: 'SPY',
      etf: 'SPY',
      fund: 'URTH',
      bond: 'SPY',
      commodity: 'SPY',
      real_estate: 'SPY',
    };

    const recommendedSymbol = typeToBenchmark[dominantType] || 'SPY';
    const benchmark = await Benchmark.getBySymbol(recommendedSymbol);

    // Si no existe el benchmark en la BD, retornar fallback
    if (!benchmark) {
      console.warn(`Benchmark ${recommendedSymbol} not found in database. Run seeder to populate benchmarks.`);
      return {
        symbol: recommendedSymbol,
        name: recommendedSymbol === 'BTC' ? 'Bitcoin' : recommendedSymbol === 'SPY' ? 'S&P 500' : 'Market Index',
        reason: `Portfolio dominado por ${dominantType} (benchmark no inicializado)`,
      };
    }

    return {
      symbol: benchmark.symbol,
      name: benchmark.name,
      reason: `Portfolio dominado por ${dominantType}`,
    };
  }
}

export default new BenchmarkService();
