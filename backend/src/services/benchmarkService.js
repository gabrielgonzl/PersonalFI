/**
 * Servicio para benchmarking y comparación con índices de mercado
 */
import { Benchmark, PriceHistory, Asset } from '../models/index.js';
import priceHistoryService from './priceHistoryService.js';
import logger from '../config/logger.js';
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

    // Si no hay datos históricos, intentar obtener de la API
    if (benchmarkPrices.length === 0) {
      logger.warn(`⚠️  No price history for benchmark ${benchmarkSymbol}, fetching from API...`);
      // Intentar obtener precios de la API
      await this.generateSyntheticBenchmarkPrices(benchmark._id, startDate, endDate);

      // Reintentamos obtener los precios
      const retryPrices = await PriceHistory.find({
        assetId: benchmark._id,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      if (retryPrices.length === 0) {
        logger.warn(`⚠️  No price data available for benchmark ${benchmarkSymbol}`);
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
   * Obtener precios para benchmark - OPTIMIZADO para minimizar llamadas a API
   *
   * ESTRATEGIA:
   * 1. Verificar si ya existen datos históricos en MongoDB
   * 2. Solo llamar a SteadyAPI si NO hay datos o están incompletos
   * 3. Guardar datos obtenidos en MongoDB para reutilizarlos
   * 4. Retornar vacío si la API falla (NO generar datos sintéticos)
   */
  async generateSyntheticBenchmarkPrices(benchmarkId, startDate, endDate) {
    const benchmark = await Benchmark.findById(benchmarkId);
    if (!benchmark) {
      throw new Error('Benchmark not found');
    }

    // ========== PASO 1: VERIFICAR SI YA TENEMOS DATOS EN MONGODB ==========
    const existingPricesCount = await PriceHistory.countDocuments({
      assetId: benchmarkId,
      date: { $gte: startDate, $lte: endDate },
      source: { $in: ['steadyapi', 'yahoo_finance', 'api'] }, // Solo datos reales
    });

    const startBenchmark = new Date(startDate);
    const endBenchmark = new Date(endDate);
    const expectedDays = Math.ceil((endBenchmark - startBenchmark) / (1000 * 60 * 60 * 24));
    const coveragePercentage = (existingPricesCount / expectedDays) * 100;

    if (coveragePercentage > 80) {
      logger.info(`✅ Ya existen ${existingPricesCount} precios REALES en MongoDB para ${benchmark.symbol}`);
      logger.info(`⏭️  Saltando llamada a API (${coveragePercentage.toFixed(0)}% cobertura)`);
      
      // Retornar datos existentes
      const existingPrices = await PriceHistory.find({
        assetId: benchmarkId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      return existingPrices.map((p) => ({
        assetId: p.assetId,
        date: p.date,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
        source: p.source,
        currency: p.currency,
      }));
    }

    // ========== PASO 2: INTENTAR OBTENER DATOS REALES DE STEADYAPI ==========
    logger.info(`🔍 Obteniendo datos REALES de SteadyAPI para benchmark ${benchmark.symbol}...`);
    const priceService = await import('../utils/priceService.js');

    try {
      // Los benchmarks suelen ser ETFs o índices (generalmente tipo STOCKS o ETF)
      const steadyType = benchmark.category === 'crypto' ? 'STOCKS' : 'STOCKS'; // SteadyAPI solo tiene STOCKS, ETF, MUTUALFUNDS

      const apiPrices = await priceService.default.fetchHistoricalPrices(
        benchmark.symbol,
        startBenchmark,
        endBenchmark,
        steadyType
      );

      if (apiPrices && apiPrices.length > 0) {
        const prices = apiPrices.map((price) => ({
          assetId: benchmarkId,
          date: new Date(price.date),
          open: price.open,
          high: price.high,
          low: price.low,
          close: price.close,
          volume: price.volume || 0,
          source: 'steadyapi', // Marcar como datos REALES de SteadyAPI
          currency: benchmark.currency,
        }));

        logger.info(`✅ Obtenidos ${prices.length} precios REALES de SteadyAPI para ${benchmark.symbol}`);
        logger.info(`💾 Guardando en MongoDB...`);

        if (prices.length > 0) {
          await PriceHistory.bulkInsertPrices(prices);
        }

        return prices;
      } else {
        logger.warn(`⚠️  SteadyAPI no retornó datos para ${benchmark.symbol}`);
        return [];
      }
    } catch (error) {
      logger.error(`❌ Error al obtener datos de SteadyAPI para ${benchmark.symbol}: ${error.message}`);
      return [];
    }

    // DATOS SINTÉTICOS ELIMINADOS - Solo usamos datos reales de SteadyAPI o datos existentes en MongoDB
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
