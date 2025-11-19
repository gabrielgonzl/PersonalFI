/**
 * Servicio de actualización de precios - Yahoo Finance v1 via RapidAPI
 * Integración con yahoo-finance15.p.rapidapi.com
 * Base URL: https://yahoo-finance15.p.rapidapi.com/api
 * 
 * ENDPOINTS DISPONIBLES (probados y funcionando):
 * ✅ /api/v2/markets/tickers - Lista de tickers del mercado
 * ✅ /api/v1/markets/insider-trades - Operaciones internas
 * ✅ /api/v1/markets/quotes - Cotizaciones en tiempo real (ticker param)
 * ✅ /api/v2/stock/history - Datos históricos (ticker, from, to params)
 * ✅ /api/v1/stock/profile - Perfil de empresa
 * ✅ /api/v1/stock/statistics - Estadísticas
 * ✅ /api/v1/stock/financial-data - Datos financieros
 * ✅ /api/v1/search - Buscar símbolos
 * 
 * NOTA: Todos los endpoints usan 'markets' (plural) en v1, no 'market' (singular)
 */

import axios from 'axios';
import NodeCache from 'node-cache';
import logger from '../config/logger.js';

// Configuración de RapidAPI (para precios actuales)
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'yahoo-finance15.p.rapidapi.com';
const PRICE_UPDATE_MODE = process.env.PRICE_UPDATE_MODE || 'manual';
const API_BASE = `https://${RAPIDAPI_HOST}/api`;

// Configuración de SteadyAPI (para datos históricos)
const STEADYAPI_KEY = process.env.STEADYAPI_KEY;
const STEADYAPI_BASE_URL = process.env.STEADYAPI_BASE_URL || 'https://api.steadyapi.com';

// Configuración de reintentos
const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY = 2000; // 2 segundos

// MEJORA: Cache con node-cache (evita memory leaks, auto-limpieza)
const priceCache = new NodeCache({
  stdTTL: 60, // 60 segundos de TTL
  checkperiod: 120, // Limpiar cada 2 minutos
  maxKeys: 1000, // Máximo 1000 entradas en cache
  deleteOnExpire: true,
  useClones: false, // No clonar objetos para mejor performance
});
const CACHE_TTL = 60; // 1 minuto (en segundos)

/**
 * Verificar si el modo automático está habilitado
 */
const isAutoMode = () => {
  return PRICE_UPDATE_MODE === 'auto' && RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here';
};

/**
 * Obtener precio de caché si existe y es válido
 * MEJORA: Ahora usa node-cache que maneja TTL automáticamente
 */
const getFromCache = (key) => {
  const cached = priceCache.get(key);
  if (cached) {
    logger.debug(`Price cache HIT for ${key}`);
    return cached;
  }
  logger.debug(`Price cache MISS for ${key}`);
  return null;
};

/**
 * Guardar precio en caché
 * MEJORA: node-cache maneja TTL y limpieza automáticamente
 */
const saveToCache = (key, data) => {
  priceCache.set(key, data, CACHE_TTL);
};

/**
 * Implementar sleep para reintentos con backoff exponencial + jitter
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hacer petición a RapidAPI con reintentos y backoff exponencial
 */
const fetchFromRapidAPI = async (endpoint, symbol, retryCount = 0) => {
  const url = `https://${RAPIDAPI_HOST}${endpoint}`;

  logger.debug(`Fetching from RapidAPI: ${endpoint} for ${symbol} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    const isNetworkError = error.code === 'ECONNABORTED' ||
                          error.code === 'ETIMEDOUT' ||
                          error.code === 'ENOTFOUND' ||
                          error.response?.status >= 500;

    // Reintentar solo si es un error de red/servidor y no hemos excedido los reintentos
    if (isNetworkError && retryCount < MAX_RETRIES) {
      // MEJORA: Backoff exponencial CON jitter para evitar thundering herd
      const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // 2s, 4s, 8s, 16s
      const jitter = Math.random() * 1000; // Jitter aleatorio 0-1000ms
      const delay = baseDelay + jitter;
      logger.warn(`Network error for ${symbol}, retrying in ${delay.toFixed(0)}ms... (${retryCount + 1}/${MAX_RETRIES})`);

      await sleep(delay);
      return fetchFromRapidAPI(endpoint, symbol, retryCount + 1);
    }

    // Si no es un error de red o ya agotamos los reintentos, lanzar el error
    const statusCode = error.response?.status || 'N/A';
    const errorData = error.response?.data;
    const errorMessage = error.response?.data?.message || error.message;

    logger.error(`RapidAPI fetch error for ${symbol} [${statusCode}]: ${errorMessage}`);
    if (errorData && typeof errorData === 'object') {
      logger.error(`Error details:`, JSON.stringify(errorData));
    }

    throw error;
  }
};

/**
 * Obtener precio actual de un símbolo usando /api/v1/markets/quotes
 * Endpoint real: https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quotes
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

    // Obtener cotización usando el endpoint v1/markets/quotes (real-time)
    // Nota: La API usa 'markets' (plural) en la ruta
    const endpoint = `/api/v1/markets/quotes?ticker=${encodeURIComponent(formattedSymbol)}`;
    const data = await fetchFromRapidAPI(endpoint, formattedSymbol);

    // Extraer información relevante de la respuesta
    // La API puede devolver diferentes estructuras, intentamos manejar varias
    let quote = null;

    if (data && data.body && Array.isArray(data.body) && data.body.length > 0) {
      quote = data.body[0];
    } else if (data && Array.isArray(data) && data.length > 0) {
      quote = data[0];
    } else if (data && typeof data === 'object') {
      quote = data;
    }

    if (quote) {
      const priceData = {
        symbol: quote.symbol || formattedSymbol,
        price: quote.regularMarketPrice || quote.price || quote.currentPrice || quote.lastPrice,
        previousClose: quote.previousClose || quote.regularMarketPreviousClose,
        change: quote.regularMarketChange || quote.change,
        changePercent: quote.regularMarketChangePercent || quote.changePercent,
        dayHigh: quote.regularMarketDayHigh || quote.dayHigh,
        dayLow: quote.regularMarketDayLow || quote.dayLow,
        volume: quote.regularMarketVolume || quote.volume,
        marketCap: quote.marketCap,
        currency: quote.currency || 'USD',
        timestamp: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000) : new Date(),
        displayName: quote.shortName || quote.longName || quote.displayName || symbol,
      };

      // Verificar que tengamos al menos un precio
      if (!priceData.price) {
        logger.warn(`No price data found in response for ${symbol}`);
        return null;
      }

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
 * Obtener precios históricos usando SteadyAPI
 * OPTIMIZADO: Solo hace llamadas si los datos NO están en MongoDB
 * 
 * @param {string} symbol - Símbolo del activo
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @param {string} type - Tipo de activo ('STOCKS', 'ETF', 'MUTUALFUNDS')
 * @returns {Array|null} - Array de precios históricos o null
 */
export const fetchHistoricalPrices = async (symbol, startDate, endDate, type = 'STOCKS') => {
  // Modo manual: retornar null
  if (!isAutoMode()) {
    logger.debug(`Historical prices requested for ${symbol} - MANUAL MODE: returning null`);
    return null;
  }

  if (!STEADYAPI_KEY || STEADYAPI_KEY === 'your_steadyapi_key_here') {
    logger.warn(`SteadyAPI key not configured - cannot fetch historical prices for ${symbol}`);
    return null;
  }

  try {
    // Convertir fechas a formato YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Construir URL con parámetros
    const url = new URL(`${STEADYAPI_BASE_URL}/v2/markets/stock/historical`);
    url.searchParams.append('ticker', symbol);
    url.searchParams.append('type', type);
    url.searchParams.append('from_date', formattedStartDate);
    url.searchParams.append('to_date', formattedEndDate);
    url.searchParams.append('limit', '10000'); // Máximo posible

    logger.debug(`Fetching historical data from SteadyAPI: ${symbol} (${formattedStartDate} to ${formattedEndDate})`);

    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': `Bearer ${STEADYAPI_KEY}`,
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 segundos
    });

    if (!response.data || !response.data.body || !Array.isArray(response.data.body)) {
      logger.warn(`No historical data found for ${symbol} in SteadyAPI response`);
      return null;
    }

    // Transformar datos de SteadyAPI al formato esperado
    const historicalData = response.data.body.map((item) => {
      // Parsear fecha (formato: MM/DD/YYYY)
      const [month, day, year] = item.date.split('/');
      const date = new Date(`${year}-${month}-${day}`);

      // Limpiar valores (remover comas y convertir a números)
      const cleanNumber = (str) => {
        if (!str) return 0;
        return parseFloat(str.toString().replace(/,/g, ''));
      };

      return {
        date,
        open: cleanNumber(item.open),
        high: cleanNumber(item.high),
        low: cleanNumber(item.low),
        close: cleanNumber(item.close),
        volume: cleanNumber(item.volume),
      };
    }).filter((item) => !isNaN(item.close) && item.close > 0);

    // Ordenar por fecha ascendente
    historicalData.sort((a, b) => a.date - b.date);

    logger.info(`✅ Fetched ${historicalData.length} historical prices from SteadyAPI for ${symbol}`);

    return historicalData;

  } catch (error) {
    if (error.response) {
      logger.error(`SteadyAPI error for ${symbol}:`);
      logger.error(`  Status: ${error.response.status}`);
      logger.error(`  Data:`, JSON.stringify(error.response.data, null, 2));
      logger.error(`  Message: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      logger.error(`SteadyAPI no response for ${symbol}:`, error.message);
      logger.error(`  Request was made but no response received`);
    } else {
      logger.error(`Error fetching historical prices for ${symbol}:`, error.message);
      logger.error(`  Full error:`, error);
    }
    return null;
  }

  /* CÓDIGO COMENTADO - El endpoint no existe en esta API
  try {
    // Verificar caché
    const cacheKey = `historical_${symbol}_${startDate}_${endDate}_${interval}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Convertir fechas a formato YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // ENDPOINT NO EXISTE: /api/v2/stock/history retorna 404
    const endpoint = `/api/v2/stock/history?symbol=${encodeURIComponent(symbol)}&from=${formattedStartDate}&to=${formattedEndDate}`;
    const data = await fetchFromRapidAPI(endpoint, symbol);

    // Extraer datos de precios
    let historicalData = [];

    // La API puede devolver diferentes estructuras
    if (data && data.body && data.body.historical && Array.isArray(data.body.historical)) {
      historicalData = data.body.historical.map(item => ({
        date: new Date(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
    } else if (data && Array.isArray(data)) {
      historicalData = data.map(item => ({
        date: new Date(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
    }

    // Filtrar datos nulos y ordenar por fecha
    historicalData = historicalData
      .filter(item => item.close !== null && !isNaN(item.close))
      .sort((a, b) => a.date - b.date);

    if (historicalData.length > 0) {
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
  */ // FIN DEL CÓDIGO COMENTADO
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
      await sleep(200);

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
 * Buscar símbolos por nombre o keyword usando /api/v1/search
 * Endpoint: https://yahoo-finance15.p.rapidapi.com/api/v1/search
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
    // Endpoint correcto de búsqueda
    const endpoint = `/api/v1/search?query=${encodeURIComponent(query)}`;
    const data = await fetchFromRapidAPI(endpoint, query);

    let results = [];

    // Manejar diferentes estructuras de respuesta
    if (data && data.body && Array.isArray(data.body)) {
      results = data.body.map(item => ({
        symbol: item.symbol,
        name: item.name || item.longName || item.shortName,
        type: item.typeDisp || item.quoteType || item.type,
        exchange: item.exchDisp || item.exchange,
      }));
    } else if (data && Array.isArray(data)) {
      results = data.map(item => ({
        symbol: item.symbol,
        name: item.name || item.longName || item.shortName,
        type: item.typeDisp || item.quoteType || item.type,
        exchange: item.exchDisp || item.exchange,
      }));
    }

    return results;
  } catch (error) {
    logger.error(`Symbol search error for "${query}":`, error.message);
    return [];
  }
};

/**
 * Obtener información del modo de precios
 * MEJORA: Ahora incluye estadísticas del cache node-cache
 * @returns {Object} - Información del modo actual
 */
export const getPriceServiceInfo = () => {
  const stats = priceCache.getStats();
  return {
    mode: PRICE_UPDATE_MODE,
    autoEnabled: isAutoMode(),
    apiConfigured: !!(RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here'),
    host: RAPIDAPI_HOST,
    cache: {
      size: priceCache.keys().length,
      ttl: CACHE_TTL,
      maxKeys: 1000,
      hits: stats.hits,
      misses: stats.misses,
      keys: stats.keys,
    },
    maxRetries: MAX_RETRIES,
    initialRetryDelay: INITIAL_RETRY_DELAY,
  };
};

/**
 * Limpiar caché de precios
 * MEJORA: Usa métodos de node-cache
 */
export const clearPriceCache = () => {
  const keys = priceCache.keys();
  const size = keys.length;
  priceCache.flushAll();
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
  searchSymbols,
  getPriceServiceInfo,
  clearPriceCache,
};
