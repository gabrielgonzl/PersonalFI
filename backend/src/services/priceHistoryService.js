/**
 * Servicio para manejar precios históricos
 */
import { PriceHistory, Asset, Contribution } from '../models/index.js';
import { subDays, subMonths, eachDayOfInterval, startOfDay } from 'date-fns';

class PriceHistoryService {
  /**
   * Generar historial de precios - OPTIMIZADO para minimizar llamadas a API
   * 
   * ESTRATEGIA:
   * 1. Verificar si ya existen datos históricos en MongoDB
   * 2. Solo llamar a SteadyAPI si NO hay datos o están incompletos
   * 3. Guardar datos obtenidos en MongoDB para reutilizarlos
   * 4. Fallback a datos sintéticos solo si la API falla
   */
  async generateSyntheticPriceHistory(assetId) {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Obtener todas las contribuciones ordenadas por fecha
    const contributions = await Contribution.find({ assetId }).sort({ date: 1 });

    if (contributions.length === 0) {
      console.log(`No contributions found for asset ${assetId}`);
      return [];
    }

    const firstDate = contributions[0].date;
    const lastDate = new Date();

    // ========== PASO 1: VERIFICAR SI YA TENEMOS DATOS EN MONGODB ==========
    const existingPricesCount = await PriceHistory.countDocuments({
      assetId,
      date: { $gte: firstDate, $lte: lastDate },
      source: { $in: ['steadyapi', 'yahoo_finance', 'api'] }, // Solo datos reales, no sintéticos
    });

    const expectedDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
    const coveragePercentage = (existingPricesCount / expectedDays) * 100;

    if (coveragePercentage > 80) {
      console.log(`   ✅ Ya existen ${existingPricesCount} precios REALES en MongoDB para ${asset.symbol} (${coveragePercentage.toFixed(0)}% cobertura)`);
      console.log(`   ⏭️  Saltando llamada a API (usando datos existentes)`);
      
      // Retornar datos existentes
      const existingPrices = await PriceHistory.find({
        assetId,
        date: { $gte: firstDate, $lte: lastDate },
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
    console.log(`   🔍 Obteniendo datos REALES de SteadyAPI para ${asset.symbol}...`);
    const priceService = await import('../utils/priceService.js');
    
    try {
      // Determinar tipo de asset para SteadyAPI
      const assetTypeMap = {
        stock: 'STOCKS',
        etf: 'ETF',
        fund: 'MUTUALFUNDS',
        mutual_fund: 'MUTUALFUNDS',
      };
      const steadyType = assetTypeMap[asset.type] || 'STOCKS';

      const apiPrices = await priceService.default.fetchHistoricalPrices(
        asset.symbol,
        firstDate,
        lastDate,
        steadyType
      );

      if (apiPrices && apiPrices.length > 0) {
        const prices = apiPrices.map((price) => ({
          assetId,
          date: new Date(price.date),
          open: price.open,
          high: price.high,
          low: price.low,
          close: price.close,
          volume: price.volume || 0,
          source: 'steadyapi', // Marcar como datos REALES de SteadyAPI
          currency: asset.currency,
        }));

        console.log(`   ✅ Obtenidos ${prices.length} precios REALES de SteadyAPI para ${asset.symbol}`);
        console.log(`   💾 Guardando en MongoDB para reutilizar...`);
        
        return prices;
      }
    } catch (error) {
      console.log(`   ⚠️  Error al obtener datos de SteadyAPI: ${error.message}`);
    }

    // ========== PASO 3: FALLBACK A DATOS SINTÉTICOS ==========
    console.log(`   📊 Generando precios sintéticos para ${asset.symbol} (API no disponible)...`);
    const prices = [];

    // Generar precios diarios usando interpolación y volatilidad sintética
    const allDays = eachDayOfInterval({ start: firstDate, end: lastDate });

    let lastKnownPrice = contributions[0].pricePerUnit;
    let nextContributionIndex = 1;

    for (const day of allDays) {
      // Buscar si hay una contribución en este día
      const contribution = contributions.find(
        (c) => startOfDay(new Date(c.date)).getTime() === startOfDay(day).getTime()
      );

      if (contribution) {
        // Usar el precio real de la contribución
        lastKnownPrice = contribution.pricePerUnit;
        prices.push({
          assetId,
          date: startOfDay(day),
          open: lastKnownPrice * 0.995, // Simulación de variación intraday
          high: lastKnownPrice * 1.01,
          low: lastKnownPrice * 0.99,
          close: lastKnownPrice,
          volume: contribution.quantity,
          source: 'synthetic',
          currency: asset.currency,
        });
      } else {
        // Generar precio sintético con volatilidad realista
        // Volatilidad diaria típica: 0.5% - 2% para activos tradicionales
        const volatility = this.getVolatilityForAssetType(asset.type);
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = lastKnownPrice * (1 + randomChange);

        prices.push({
          assetId,
          date: startOfDay(day),
          open: lastKnownPrice,
          high: Math.max(lastKnownPrice, newPrice) * 1.005,
          low: Math.min(lastKnownPrice, newPrice) * 0.995,
          close: newPrice,
          volume: 0,
          source: 'synthetic',
          currency: asset.currency,
        });

        lastKnownPrice = newPrice;
      }
    }

    // Ajustar el último precio al precio actual real
    if (prices.length > 0) {
      const lastPrice = prices[prices.length - 1];
      lastPrice.close = asset.currentPrice;
      lastPrice.high = Math.max(lastPrice.high, asset.currentPrice);
      lastPrice.low = Math.min(lastPrice.low, asset.currentPrice);
    }

    return prices;
  }

  /**
   * Obtener volatilidad típica por tipo de activo
   */
  getVolatilityForAssetType(type) {
    const volatilityMap = {
      crypto: 0.03, // 3% diario
      stock: 0.015, // 1.5% diario
      etf: 0.01, // 1% diario
      fund: 0.008, // 0.8% diario
      bond: 0.005, // 0.5% diario
      commodity: 0.02, // 2% diario
      real_estate: 0.003, // 0.3% diario
    };

    return volatilityMap[type] || 0.01;
  }

  /**
   * Poblar base de datos con precios históricos sintéticos para todos los assets
   */
  async populateAllAssets() {
    const assets = await Asset.find();
    const results = [];

    for (const asset of assets) {
      try {
        console.log(`Generating price history for ${asset.name} (${asset.symbol})...`);
        const prices = await this.generateSyntheticPriceHistory(asset._id);

        if (prices.length > 0) {
          await PriceHistory.bulkInsertPrices(prices);
          results.push({
            assetId: asset._id,
            name: asset.name,
            pricesGenerated: prices.length,
            success: true,
          });
          console.log(`✓ Generated ${prices.length} price points for ${asset.name}`);
        }
      } catch (error) {
        console.error(`✗ Error generating prices for ${asset.name}:`, error.message);
        results.push({
          assetId: asset._id,
          name: asset.name,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Obtener precios históricos con granularidad específica
   */
  async getPriceHistory(assetId, startDate, endDate, granularity = 'day') {
    // Verificar si existen precios históricos
    const count = await PriceHistory.countDocuments({ assetId });

    if (count === 0) {
      // Generar precios sintéticos si no existen
      console.log(`No price history found for asset ${assetId}, generating synthetic data...`);
      const prices = await this.generateSyntheticPriceHistory(assetId);
      if (prices.length > 0) {
        await PriceHistory.bulkInsertPrices(prices);
      }
    }

    // Obtener precios con la granularidad especificada
    if (granularity === 'day') {
      return PriceHistory.getPriceRange(assetId, startDate, endDate);
    } else {
      return PriceHistory.aggregateByGranularity(assetId, startDate, endDate, granularity);
    }
  }

  /**
   * Obtener precio en una fecha específica
   */
  async getPriceAtDate(assetId, date) {
    let price = await PriceHistory.getPriceAtDate(assetId, date);

    if (!price) {
      // Si no existe, generar historial sintético
      await this.generateSyntheticPriceHistory(assetId);
      price = await PriceHistory.getPriceAtDate(assetId, date);
    }

    return price;
  }

  /**
   * Calcular retornos históricos
   */
  async calculateReturns(assetId, startDate, endDate) {
    const prices = await this.getPriceHistory(assetId, startDate, endDate, 'day');

    if (prices.length < 2) {
      return [];
    }

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const previousClose = prices[i - 1].close;
      const currentClose = prices[i].close;
      const dailyReturn = (currentClose - previousClose) / previousClose;

      returns.push({
        date: prices[i].date,
        return: dailyReturn,
        price: currentClose,
      });
    }

    return returns;
  }

  /**
   * Poblar benchmarks con datos históricos
   */
  async populateBenchmarkHistory(benchmarkId, prices) {
    if (!prices || prices.length === 0) {
      throw new Error('No prices provided');
    }

    // Usar bulkInsertPrices para inserción eficiente
    const formattedPrices = prices.map((p) => ({
      assetId: benchmarkId, // Reutilizamos el modelo PriceHistory
      date: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume || 0,
      source: p.source || 'manual',
      currency: p.currency || 'USD',
    }));

    return PriceHistory.bulkInsertPrices(formattedPrices);
  }

  /**
   * Limpiar historial de precios sintéticos (útil para testing)
   */
  async clearSyntheticPrices() {
    return PriceHistory.deleteMany({ source: 'synthetic' });
  }

  /**
   * Obtener estadísticas de precios históricos
   */
  async getPriceStatistics(assetId) {
    const prices = await PriceHistory.find({ assetId }).sort({ date: 1 });

    if (prices.length === 0) {
      return null;
    }

    const closes = prices.map((p) => p.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const avg = closes.reduce((sum, p) => sum + p, 0) / closes.length;

    // Calcular retornos
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i].close - prices[i - 1].close) / prices[i - 1].close);
    }

    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;

    // Volatilidad (desviación estándar)
    const variance =
      returns.length > 0
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        : 0;
    const volatility = Math.sqrt(variance);

    return {
      dataPoints: prices.length,
      firstDate: prices[0].date,
      lastDate: prices[prices.length - 1].date,
      minPrice: min,
      maxPrice: max,
      avgPrice: avg,
      currentPrice: prices[prices.length - 1].close,
      avgDailyReturn: avgReturn,
      dailyVolatility: volatility,
      annualizedVolatility: volatility * Math.sqrt(252), // 252 días de trading
    };
  }
}

export default new PriceHistoryService();
