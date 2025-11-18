/**
 * Servicio de analytics y métricas financieras
 * ACTUALIZADO: Ahora usa precios históricos reales
 */
import logger from '../config/logger.js';

import { Asset, Portfolio, Contribution, PriceHistory } from '../models/index.js';
import {
  calculateSimpleReturn,
  calculatePerformanceMetrics,
  calculateTimeline,
  calculateAllocation,
  calculateRiskMetrics,
  calculateHHI,
} from '../utils/calculations.js';
import { TIME_PERIODS } from '../config/constants.js';
import { subDays, subMonths, subYears } from 'date-fns';
import benchmarkService from './benchmarkService.js';

class AnalyticsService {
  /**
   * Obtener overview completo del dashboard
   */
  async getOverview() {
    // Totales globales de assets
    const assetTotals = await Asset.getGlobalTotals();

    // Totales de portfolios
    const portfolios = await Portfolio.find({ isActive: true });
    const totalCash = portfolios.reduce((sum, p) => sum + p.cashBalance, 0);

    // Número de assets y portfolios
    const assetsCount = await Asset.countDocuments();
    const portfoliosCount = await Portfolio.countDocuments({ isActive: true });

    // Distribución por tipo
    const byType = await Asset.getDistributionByType();

    // Top performers (mejores 5)
    const topPerformers = await Asset.find({ profitLossPercentage: { $gt: 0 } })
      .sort({ profitLossPercentage: -1 })
      .limit(5)
      .select('name symbol profitLoss profitLossPercentage currentValue');

    // Worst performers (peores 5)
    const worstPerformers = await Asset.find({ profitLossPercentage: { $lt: 0 } })
      .sort({ profitLossPercentage: 1 })
      .limit(5)
      .select('name symbol profitLoss profitLossPercentage currentValue');

    return {
      summary: {
        totalValue: assetTotals.totalValue + totalCash,
        totalInvested: assetTotals.totalInvested,
        totalCash,
        profitLoss: assetTotals.profitLoss,
        profitLossPercentage: assetTotals.profitLossPercentage,
        assetsCount,
        portfoliosCount,
      },
      byType,
      topPerformers,
      worstPerformers,
    };
  }

  /**
   * Obtener rendimiento histórico
   * CORREGIDO: Ahora usa precios históricos reales en lugar del precio actual
   */
  async getPerformance(period = 'all', granularity = 'day') {
    // Calcular fecha de inicio según período
    const endDate = new Date();
    let startDate;

    switch (period) {
      case TIME_PERIODS['7D']:
        startDate = subDays(endDate, 7);
        break;
      case TIME_PERIODS['1M']:
        startDate = subMonths(endDate, 1);
        break;
      case TIME_PERIODS['3M']:
        startDate = subMonths(endDate, 3);
        break;
      case TIME_PERIODS['6M']:
        startDate = subMonths(endDate, 6);
        break;
      case TIME_PERIODS['1Y']:
        startDate = subYears(endDate, 1);
        break;
      default:
        // All time: buscar primera contribución
        const firstContribution = await Contribution.findOne().sort({ date: 1 });
        startDate = firstContribution ? firstContribution.date : subYears(endDate, 5);
        break;
    }

    // Obtener todas las contribuciones en el período
    const contributions = await Contribution.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Obtener todos los assets
    const assets = await Asset.find();

    // ========== OPTIMIZACIÓN: BATCH FETCH DE PRECIOS HISTÓRICOS ==========
    // En lugar de 1,825 queries (365 días × 5 assets), hacer solo 5 queries
    const priceMap = {};

    for (const asset of assets) {
      const prices = await PriceHistory.find({
        assetId: asset._id,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 }).select('date close');

      // Crear lookup map para O(1) access
      const assetIdStr = asset._id.toString();
      priceMap[assetIdStr] = {};

      prices.forEach((priceDoc) => {
        const dateKey = priceDoc.date.toISOString().split('T')[0];
        priceMap[assetIdStr][dateKey] = priceDoc.close;
      });
    }

    // Helper para obtener precio más cercano
    const getPriceForDate = (assetIdStr, date) => {
      const dateKey = date.toISOString().split('T')[0];

      // Intentar fecha exacta
      if (priceMap[assetIdStr] && priceMap[assetIdStr][dateKey]) {
        return priceMap[assetIdStr][dateKey];
      }

      // Buscar precio más reciente anterior a esta fecha
      const assetPrices = priceMap[assetIdStr];
      if (!assetPrices) return null;

      const sortedDates = Object.keys(assetPrices).sort().reverse();
      for (const priceDate of sortedDates) {
        if (priceDate <= dateKey) {
          return assetPrices[priceDate];
        }
      }

      return null;
    };

    // Crear timeline día por día
    const timeline = [];
    const assetQuantities = {};
    let cumulativeInvested = 0;

    // Inicializar cantidades de assets
    assets.forEach((asset) => {
      assetQuantities[asset._id.toString()] = 0;
    });

    // Procesar día por día
    const currentDate = new Date(startDate);
    let contributionIndex = 0;

    while (currentDate <= endDate) {
      // Procesar contribuciones de este día
      while (
        contributionIndex < contributions.length &&
        new Date(contributions[contributionIndex].date) <= currentDate
      ) {
        const contrib = contributions[contributionIndex];
        const assetIdStr = contrib.assetId.toString();

        if (contrib.type === 'buy') {
          cumulativeInvested += contrib.totalAmount + (contrib.fees || 0);
          assetQuantities[assetIdStr] = (assetQuantities[assetIdStr] || 0) + contrib.quantity;
        } else if (contrib.type === 'sell') {
          cumulativeInvested -= contrib.totalAmount - (contrib.fees || 0);
          assetQuantities[assetIdStr] = (assetQuantities[assetIdStr] || 0) - contrib.quantity;
        }

        contributionIndex++;
      }

      // Calcular valor total usando precios históricos (ahora desde memoria)
      let totalValue = 0;

      for (const asset of assets) {
        const assetIdStr = asset._id.toString();
        const quantity = assetQuantities[assetIdStr] || 0;

        if (quantity > 0) {
          // Obtener precio desde el map en memoria (O(1) lookup)
          const price = getPriceForDate(assetIdStr, currentDate);

          if (price) {
            totalValue += quantity * price;
          } else {
            // Fallback al precio actual si no hay histórico
            totalValue += quantity * asset.currentPrice;
          }
        }
      }

      // Solo agregar al timeline si hay datos relevantes
      if (cumulativeInvested > 0 || totalValue > 0) {
        timeline.push({
          date: new Date(currentDate),
          totalInvested: Number(cumulativeInvested.toFixed(2)),
          totalValue: Number(totalValue.toFixed(2)),
          profitLoss: Number((totalValue - cumulativeInvested).toFixed(2)),
          profitLossPercentage:
            cumulativeInvested > 0
              ? Number((((totalValue - cumulativeInvested) / cumulativeInvested) * 100).toFixed(2))
              : 0,
        });
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aplicar granularidad si no es 'day'
    let processedTimeline = timeline;
    if (granularity !== 'day' && timeline.length > 0) {
      processedTimeline = this.aggregateTimelineByGranularity(timeline, granularity);
    }

    // Calcular métricas del período
    const startValue = processedTimeline.length > 0 ? processedTimeline[0].totalInvested : 0;
    const endValue = processedTimeline.length > 0 ? processedTimeline[processedTimeline.length - 1].totalValue : 0;
    const totalReturn = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;

    return {
      period,
      granularity,
      timeline: processedTimeline,
      summary: {
        startValue: Number(startValue.toFixed(2)),
        endValue: Number(endValue.toFixed(2)),
        totalReturn: Number(totalReturn.toFixed(2)),
        totalInvestedInPeriod: Number(cumulativeInvested.toFixed(2)),
      },
    };
  }

  /**
   * Agregar timeline por granularidad (semana, mes, año)
   */
  aggregateTimelineByGranularity(timeline, granularity) {
    if (granularity === 'day') return timeline;

    const aggregated = [];
    let currentPeriod = null;
    let periodData = null;

    timeline.forEach((point) => {
      const date = new Date(point.date);
      let periodKey;

      switch (granularity) {
        case 'week':
          // Usar el inicio de la semana como key
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          periodKey = `${date.getFullYear()}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (currentPeriod !== periodKey) {
        if (periodData) {
          aggregated.push(periodData);
        }
        currentPeriod = periodKey;
        periodData = { ...point };
      } else {
        // Actualizar con el último valor del período
        periodData = { ...point };
      }
    });

    // Agregar último período
    if (periodData) {
      aggregated.push(periodData);
    }

    return aggregated;
  }

  /**
   * Obtener distribución de inversiones
   */
  async getDistribution() {
    const assets = await Asset.find();
    const portfolios = await Portfolio.find({ isActive: true });

    // Distribución por tipo
    const byType = await Asset.getDistributionByType();

    // Calcular totales
    const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalCash = portfolios.reduce((sum, p) => sum + p.cashBalance, 0);
    const grandTotal = totalValue + totalCash;

    // Agregar porcentajes
    const byTypeWithPercentage = byType.map((item) => ({
      ...item,
      percentage: grandTotal > 0 ? (item.totalValue / grandTotal) * 100 : 0,
    }));

    // Distribución por portfolio
    const byPortfolio = [];
    for (const portfolio of portfolios) {
      const portfolioAssets = assets.filter((a) => a.portfolioId && a.portfolioId.toString() === portfolio._id.toString());
      const portfolioValue = portfolioAssets.reduce((sum, a) => sum + a.currentValue, 0) + portfolio.cashBalance;

      byPortfolio.push({
        portfolioId: portfolio._id,
        name: portfolio.name,
        value: portfolioValue,
        percentage: grandTotal > 0 ? (portfolioValue / grandTotal) * 100 : 0,
        assetsCount: portfolioAssets.length,
      });
    }

    // Assets independientes (sin portfolio)
    const independentAssets = assets.filter((a) => !a.portfolioId);
    const independentValue = independentAssets.reduce((sum, a) => sum + a.currentValue, 0);

    return {
      byType: byTypeWithPercentage,
      byPortfolio,
      independent: {
        count: independentAssets.length,
        value: independentValue,
        percentage: grandTotal > 0 ? (independentValue / grandTotal) * 100 : 0,
      },
      totalValue: grandTotal,
    };
  }

  /**
   * Obtener top performers
   */
  async getTopPerformers(limit = 10, sortBy = 'percentage') {
    const sortField = sortBy === 'absolute' ? 'profitLoss' : 'profitLossPercentage';

    const topPerformers = await Asset.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .select('name symbol type totalInvested currentValue profitLoss profitLossPercentage');

    return topPerformers.map((asset, index) => ({
      ...asset.toObject(),
      rank: index + 1,
    }));
  }

  /**
   * Obtener métricas de rendimiento de un asset específico
   */
  async getAssetPerformance(assetId, period = 'all') {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Obtener contribuciones del asset
    const contributions = await Contribution.find({ assetId }).sort({ date: 1 });

    // Calcular métricas
    const metrics = calculatePerformanceMetrics(contributions, asset.currentValue, asset.currentPrice);

    // Calcular timeline
    const timeline = calculateTimeline(contributions, asset.currentPrice);

    // Estadísticas de transacciones
    const buyCount = contributions.filter((c) => c.type === 'buy').length;
    const sellCount = contributions.filter((c) => c.type === 'sell').length;
    const totalFees = contributions.reduce((sum, c) => sum + (c.fees || 0), 0);

    return {
      assetId: asset._id,
      assetName: asset.name,
      symbol: asset.symbol,
      summary: {
        totalInvested: asset.totalInvested,
        currentValue: asset.currentValue,
        quantity: asset.quantity,
        averagePrice: asset.averagePrice,
        currentPrice: asset.currentPrice,
        profitLoss: asset.profitLoss,
        profitLossPercentage: asset.profitLossPercentage,
      },
      metrics,
      timeline,
      transactions: {
        buy: buyCount,
        sell: sellCount,
        totalFees,
      },
    };
  }

  /**
   * Obtener línea de tiempo de eventos (timeline)
   */
  async getTimeline(limit = 50) {
    // Obtener eventos recientes
    const contributions = await Contribution.find()
      .populate('assetId', 'name symbol')
      .sort({ date: -1 })
      .limit(limit);

    const events = contributions
      .filter((contrib) => contrib.assetId) // Filtrar contribuciones con assets eliminados
      .map((contrib) => ({
        date: contrib.date,
        type: 'contribution',
        subType: contrib.type,
        description: `${contrib.type === 'buy' ? 'Compra' : 'Venta'} de ${contrib.quantity} ${contrib.assetId?.symbol || 'N/A'} por $${contrib.totalAmount.toFixed(2)}`,
        assetName: contrib.assetId?.name || 'Asset eliminado',
        assetSymbol: contrib.assetId?.symbol || 'N/A',
        amount: contrib.totalAmount,
      }));

    // Obtener creación de assets
    const recentAssets = await Asset.find().sort({ createdAt: -1 }).limit(10);
    const assetEvents = recentAssets.map((asset) => ({
      date: asset.createdAt,
      type: 'asset_created',
      description: `Creado activo: ${asset.name} (${asset.symbol})`,
      assetName: asset.name,
      assetSymbol: asset.symbol,
    }));

    // Combinar y ordenar
    const allEvents = [...events, ...assetEvents].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

    return { events: allEvents };
  }

  /**
   * NUEVO: Obtener métricas de riesgo del portfolio
   */
  async getRiskMetrics(period = '1y') {
    const endDate = new Date();
    let startDate;

    switch (period) {
      case '1m':
        startDate = subMonths(endDate, 1);
        break;
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case '1y':
        startDate = subYears(endDate, 1);
        break;
      case '3y':
        startDate = subYears(endDate, 3);
        break;
      default:
        startDate = subYears(endDate, 1);
    }

    // Obtener performance histórica
    const performanceData = await this.getPerformance(period, 'day');

    if (!performanceData.timeline || performanceData.timeline.length < 2) {
      return {
        volatility: 0,
        maxDrawdown: { maxDrawdownPercentage: 0 },
        var95: { var: 0 },
        var99: { var: 0 },
        sharpeRatio: 0,
        sortinoRatio: 0,
        calmarRatio: 0,
      };
    }

    // Calcular retornos diarios
    const returns = [];
    const valueHistory = performanceData.timeline.map((p) => ({
      date: p.date,
      value: p.totalValue,
    }));

    for (let i = 1; i < performanceData.timeline.length; i++) {
      const prev = performanceData.timeline[i - 1].totalValue;
      const current = performanceData.timeline[i].totalValue;
      if (prev > 0) {
        returns.push((current - prev) / prev);
      }
    }

    // Calcular métricas de riesgo
    const riskMetrics = calculateRiskMetrics(valueHistory, returns, 3);

    // Calcular diversificación
    const assets = await Asset.find();
    const diversification = calculateHHI(assets);

    return {
      ...riskMetrics,
      diversification,
      period,
    };
  }

  /**
   * NUEVO: Comparar portfolio con benchmark
   */
  async compareWithBenchmark(benchmarkSymbol, period = '1y') {
    const endDate = new Date();
    let startDate;

    switch (period) {
      case '1m':
        startDate = subMonths(endDate, 1);
        break;
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case '1y':
        startDate = subYears(endDate, 1);
        break;
      case '3y':
        startDate = subYears(endDate, 3);
        break;
      default:
        startDate = subYears(endDate, 1);
    }

    // Obtener performance del portfolio
    const performanceData = await this.getPerformance(period, 'day');

    if (!performanceData.timeline || performanceData.timeline.length < 2) {
      return {
        benchmark: benchmarkSymbol,
        comparison: null,
        message: 'Insufficient portfolio data',
      };
    }

    // Calcular retornos del portfolio
    const portfolioReturns = [];
    for (let i = 1; i < performanceData.timeline.length; i++) {
      const prev = performanceData.timeline[i - 1].totalValue;
      const current = performanceData.timeline[i].totalValue;
      if (prev > 0) {
        portfolioReturns.push((current - prev) / prev);
      }
    }

    // Comparar con benchmark
    const benchmarkMetrics = await benchmarkService.calculateBenchmarkMetrics(
      portfolioReturns,
      benchmarkSymbol,
      startDate,
      endDate
    );

    // Obtener datos de precios del benchmark para el gráfico
    const benchmarkData = await benchmarkService.compareWithBenchmark(benchmarkSymbol, startDate, endDate);

    // Normalizar datos para comparación en gráfico (base 100)
    const portfolioNormalized = this.normalizeToBase100(performanceData.timeline);
    const benchmarkNormalized = this.normalizeToBase100(benchmarkData.data);

    return {
      benchmark: benchmarkData.benchmark,
      symbol: benchmarkSymbol,
      metrics: benchmarkMetrics,
      chartData: {
        portfolio: portfolioNormalized,
        benchmark: benchmarkNormalized,
      },
      period,
    };
  }

  /**
   * Normalizar serie de tiempo a base 100
   */
  normalizeToBase100(data) {
    if (!data || data.length === 0) return [];

    const firstValue = data[0].value || data[0].totalValue || 100;

    return data.map((point) => ({
      date: point.date,
      value: ((point.value || point.totalValue) / firstValue) * 100,
    }));
  }

  /**
   * NUEVO: Obtener benchmark recomendado o preferido del usuario
   */
  async getRecommendedBenchmark() {
    // Primero intentar obtener el benchmark preferido del usuario
    const { Settings } = await import('../models/index.js');
    const settings = await Settings.getInstance();

    if (settings && settings.preferredBenchmark) {
      const benchmarks = await benchmarkService.getActiveBenchmarks();
      const preferred = benchmarks.find((b) => b.symbol === settings.preferredBenchmark);

      if (preferred) {
        return {
          symbol: preferred.symbol,
          name: preferred.name,
          reason: 'Benchmark seleccionado por el usuario',
        };
      }
    }

    // Si no hay benchmark preferido o no existe, usar el recomendado automáticamente
    const assets = await Asset.find();
    return benchmarkService.getRecommendedBenchmark(assets);
  }

  /**
   * NUEVO: Obtener todos los benchmarks disponibles
   */
  async getAvailableBenchmarks() {
    return benchmarkService.getActiveBenchmarks();
  }
}

export default new AnalyticsService();
