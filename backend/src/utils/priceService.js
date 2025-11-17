/**
 * Servicio de actualización de precios - Yahoo Finance via RapidAPI
 * Integración con steadyapi (RapidAPI) para obtener precios en tiempo real e históricos
 */

import axios from 'axios';
import logger from '../config/logger.js';

// Configuración de RapidAPI
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'yahoo-finance127.p.rapidapi.com';
const PRICE_UPDATE_MODE = process.env.PRICE_UPDATE_MODE || 'manual';

// Cache simple para evitar exceso de llamadas a la API
const priceCache = new Map();
const CACHE_TTL = 60000; // 1 minuto

/**
 * Verificar si el modo automático está habilitado
 */
const isAutoMode = () => {
  return PRICE_UPDATE_MODE === 'auto' && RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here';
};

/**
 * Obtener precio de caché si existe y es válido
 */
const getFromCache = (key) => {
  const cached = priceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug(`Price cache HIT for ${key}`);
    return cached.data;
  }
  return null;
};

/**
 * Guardar precio en caché
 */
const saveToCache = (key, data) => {
  priceCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Hacer petición a RapidAPI usando axios
 */
const fetchFromRapidAPI = async (endpoint, symbol) => {
  const url = `https://${RAPIDAPI_HOST}${endpoint}`;

  logger.debug(`Fetching from RapidAPI: ${endpoint} for ${symbol}`);

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    logger.error(`RapidAPI fetch error for ${symbol}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Obtener precio actual de un símbolo
 * @param {string} symbol - Símbolo del activo (ej: 'AAPL', 'BTC-USD', 'MSFT')
 * @param {string} type - Tipo de activo ('stock', 'crypto', 'etf', etc.)
 * @returns {Object|null} - Datos del precio o null
 */
export const fetchCurrentPrice = async (symbol, type = 'stock') => {
  // Modo manual: retornar null
  if (!isAutoMode()) {
    logger.debug(`Price fetch requested for ${symbol} (${type}) - MANUAL MODE: returning null`);
    return null;
  }

  try {
    // Verificar caché
    const cacheKey = `current_${symbol}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Formatear símbolo para crypto (agregar -USD si no está)
    let formattedSymbol = symbol.toUpperCase();
    if (type === 'crypto' && !formattedSymbol.includes('-USD') && !formattedSymbol.includes('USD')) {
      formattedSymbol = `${formattedSymbol}-USD`;
    }

    // Obtener cotización de RapidAPI
    const data = await fetchFromRapidAPI(`/quote/${formattedSymbol}`, formattedSymbol);

    // Extraer información relevante
    if (data && data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result.length > 0) {
      const quote = data.quoteResponse.result[0];

      const priceData = {
        symbol: quote.symbol,
        price: quote.regularMarketPrice || quote.price,
        previousClose: quote.previousClose || quote.regularMarketPreviousClose,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        currency: quote.currency || 'USD',
        timestamp: new Date(quote.regularMarketTime * 1000),
        displayName: quote.shortName || quote.longName || symbol,
      };

      // Guardar en caché
      saveToCache(cacheKey, priceData);

      logger.info(`Price fetched for ${symbol}: $${priceData.price} (${priceData.changePercent?.toFixed(2)}%)`);

      return priceData;
    }

    logger.warn(`No price data found for ${symbol}`);
    return null;

  } catch (error) {
    logger.error(`Error fetching current price for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Obtener precios históricos para gráficos
 * @param {string} symbol - Símbolo del activo
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @param {string} interval - Intervalo ('1d', '1wk', '1mo')
 * @returns {Array|null} - Array de precios históricos o null
 */
export const fetchHistoricalPrices = async (symbol, startDate, endDate, interval = '1d') => {
  // Modo manual: retornar null
  if (!isAutoMode()) {
    logger.debug(`Historical prices requested for ${symbol} - MANUAL MODE: returning null`);
    return null;
  }

  try {
    // Verificar caché
    const cacheKey = `historical_${symbol}_${startDate}_${endDate}_${interval}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Convertir fechas a timestamps Unix
    const period1 = Math.floor(new Date(startDate).getTime() / 1000);
    const period2 = Math.floor(new Date(endDate).getTime() / 1000);

    // Obtener datos históricos de RapidAPI
    const endpoint = `/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;
    const data = await fetchFromRapidAPI(endpoint, symbol);

    // Extraer datos de precios
    if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      const closes = quotes.close || [];
      const opens = quotes.open || [];
      const highs = quotes.high || [];
      const lows = quotes.low || [];
      const volumes = quotes.volume || [];

      // Mapear a formato usado
      const historicalData = timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000),
        open: opens[index],
        high: highs[index],
        low: lows[index],
        close: closes[index],
        volume: volumes[index],
      })).filter(item => item.close !== null); // Filtrar datos nulos

      // Guardar en caché
      saveToCache(cacheKey, historicalData);

      logger.info(`Historical prices fetched for ${symbol}: ${historicalData.length} data points`);

      return historicalData;
    }

    logger.warn(`No historical data found for ${symbol}`);
    return null;

  } catch (error) {
    logger.error(`Error fetching historical prices for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Actualizar precios de múltiples assets
 * @param {Array} assets - Array de assets a actualizar
 * @returns {Object} - Resultado de la actualización
 */
export const updateAssetsPrices = async (assets) => {
  // Modo manual: skip
  if (!isAutoMode()) {
    logger.debug(`Bulk price update requested for ${assets.length} assets - MANUAL MODE: skipping`);
    return {
      updated: 0,
      failed: 0,
      skipped: assets.length,
      mode: 'manual',
      message: 'Manual mode active - prices must be updated manually via /assets/:id/update-price',
    };
  }

  const results = {
    updated: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  logger.info(`Starting bulk price update for ${assets.length} assets`);

  for (const asset of assets) {
    try {
      // Skip si no hay símbolo
      if (!asset.symbol) {
        results.skipped++;
        results.details.push({
          asset: asset.name,
          status: 'skipped',
          reason: 'No symbol defined',
        });
        continue;
      }

      // Skip cash y portfolios (assets virtuales)
      if (asset.type === 'cash' || asset.type === 'portfolio') {
        results.skipped++;
        continue;
      }

      // Obtener precio actual
      const priceData = await fetchCurrentPrice(asset.symbol, asset.type);

      if (priceData && priceData.price) {
        // Actualizar el asset
        asset.currentPrice = priceData.price;
        asset.lastPriceUpdate = new Date();
        await asset.save();

        results.updated++;
        results.details.push({
          asset: asset.name,
          symbol: asset.symbol,
          oldPrice: asset.currentPrice,
          newPrice: priceData.price,
          change: priceData.changePercent,
          status: 'updated',
        });

        logger.debug(`Updated price for ${asset.symbol}: $${priceData.price}`);
      } else {
        results.failed++;
        results.details.push({
          asset: asset.name,
          symbol: asset.symbol,
          status: 'failed',
          reason: 'No price data returned',
        });
      }

      // Pequeño delay para no saturar la API (rate limiting)
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      results.failed++;
      results.details.push({
        asset: asset.name,
        symbol: asset.symbol,
        status: 'error',
        reason: error.message,
      });
      logger.error(`Failed to update price for ${asset.symbol}:`, error.message);
    }
  }

  logger.info(`Bulk price update completed: ${results.updated} updated, ${results.failed} failed, ${results.skipped} skipped`);

  return results;
};

/**
 * Validar si un símbolo existe en Yahoo Finance
 * @param {string} symbol - Símbolo a validar
 * @param {string} type - Tipo de activo
 * @returns {boolean} - true si existe, false si no
 */
export const validateSymbol = async (symbol, type = 'stock') => {
  // Modo manual: aceptar cualquier símbolo
  if (!isAutoMode()) {
    logger.debug(`Symbol validation requested for ${symbol} - MANUAL MODE: returning true`);
    return true;
  }

  try {
    const priceData = await fetchCurrentPrice(symbol, type);
    return priceData !== null;
  } catch (error) {
    logger.error(`Symbol validation failed for ${symbol}:`, error.message);
    return false;
  }
};

/**
 * Buscar símbolos por nombre o keyword
 * @param {string} query - Búsqueda
 * @returns {Array} - Array de resultados
 */
export const searchSymbols = async (query) => {
  // Modo manual: retornar vacío
  if (!isAutoMode()) {
    logger.debug(`Symbol search requested for "${query}" - MANUAL MODE: returning empty`);
    return [];
  }

  try {
    const data = await fetchFromRapidAPI(`/auto-complete?q=${encodeURIComponent(query)}`, query);

    if (data && data.ResultSet && data.ResultSet.Result) {
      return data.ResultSet.Result.map(item => ({
        symbol: item.symbol,
        name: item.name,
        type: item.typeDisp,
        exchange: item.exchDisp,
      }));
    }

    return [];
  } catch (error) {
    logger.error(`Symbol search error for "${query}":`, error.message);
    return [];
  }
};

/**
 * Obtener información del modo de precios
 * @returns {Object} - Información del modo actual
 */
export const getPriceServiceInfo = () => {
  return {
    mode: PRICE_UPDATE_MODE,
    autoEnabled: isAutoMode(),
    apiConfigured: !!(RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here'),
    cacheSize: priceCache.size,
    cacheTTL: CACHE_TTL,
  };
};

/**
 * Limpiar caché de precios
 */
export const clearPriceCache = () => {
  const size = priceCache.size;
  priceCache.clear();
  logger.info(`Price cache cleared: ${size} entries removed`);
  return { cleared: size };
};

/**
 * Obtener quote completo de un símbolo (legacy - mantener por compatibilidad)
 */
export const fetchFullQuote = async (symbol) => {
  return fetchCurrentPrice(symbol);
};

export default {
  fetchCurrentPrice,
  fetchHistoricalPrices,
  updateAssetsPrices,
  validateSymbol,
  fetchFullQuote,
  searchSymbols,
  getPriceServiceInfo,
  clearPriceCache,
};
