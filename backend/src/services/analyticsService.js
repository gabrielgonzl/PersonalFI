/**
 * Servicio de analytics y métricas financieras
 */

import { Asset, Portfolio, Contribution } from '../models/index.js';
import {
  calculateSimpleReturn,
  calculatePerformanceMetrics,
  calculateTimeline,
  calculateAllocation,
} from '../utils/calculations.js';
import { TIME_PERIODS } from '../config/constants.js';
import { subDays, subMonths, subYears } from 'date-fns';

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
        startDate = null; // All time
        break;
    }

    // Obtener todas las contribuciones en el período
    const query = startDate ? { date: { $gte: startDate } } : {};
    const contributions = await Contribution.find(query).sort({ date: 1 });

    // Obtener assets actuales para calcular valores
    const assets = await Asset.find();
    const currentTotalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const currentTotalInvested = assets.reduce((sum, a) => sum + a.totalInvested, 0);

    // Crear timeline agregado
    const timeline = [];
    let cumulativeInvested = 0;
    const assetQuantities = {};

    contributions.forEach((contrib) => {
      const assetIdStr = contrib.assetId.toString();

      if (!assetQuantities[assetIdStr]) {
        assetQuantities[assetIdStr] = { quantity: 0, asset: null };
      }

      if (contrib.type === 'buy') {
        cumulativeInvested += contrib.totalAmount;
        assetQuantities[assetIdStr].quantity += contrib.quantity;
      } else if (contrib.type === 'sell') {
        cumulativeInvested -= contrib.totalAmount;
        assetQuantities[assetIdStr].quantity -= contrib.quantity;
      }

      // Calcular valor en ese momento (usando precio histórico)
      let totalValue = 0;
      Object.keys(assetQuantities).forEach((aid) => {
        const asset = assets.find((a) => a._id.toString() === aid);
        if (asset) {
          // En producción real, usaríamos precio histórico
          // Por ahora, usamos precio actual como aproximación
          totalValue += assetQuantities[aid].quantity * asset.currentPrice;
        }
      });

      timeline.push({
        date: contrib.date,
        totalInvested: cumulativeInvested,
        totalValue,
        profitLoss: totalValue - cumulativeInvested,
        profitLossPercentage: cumulativeInvested > 0 ? ((totalValue - cumulativeInvested) / cumulativeInvested) * 100 : 0,
      });
    });

    // Agregar punto actual
    timeline.push({
      date: endDate,
      totalInvested: currentTotalInvested,
      totalValue: currentTotalValue,
      profitLoss: currentTotalValue - currentTotalInvested,
      profitLossPercentage:
        currentTotalInvested > 0 ? ((currentTotalValue - currentTotalInvested) / currentTotalInvested) * 100 : 0,
    });

    // Calcular ROI del período
    const startValue = timeline.length > 1 ? timeline[0].totalInvested : 0;
    const roi = startValue > 0 ? ((currentTotalValue - startValue) / startValue) * 100 : 0;

    return {
      period,
      granularity,
      timeline,
      summary: {
        startValue,
        endValue: currentTotalValue,
        roi,
        totalInvestedInPeriod: cumulativeInvested,
      },
    };
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

    const events = contributions.map((contrib) => ({
      date: contrib.date,
      type: 'contribution',
      subType: contrib.type,
      description: `${contrib.type === 'buy' ? 'Compra' : 'Venta'} de ${contrib.quantity} ${contrib.assetId.symbol} por $${contrib.totalAmount.toFixed(2)}`,
      assetName: contrib.assetId.name,
      assetSymbol: contrib.assetId.symbol,
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
}

export default new AnalyticsService();
