/**
 * Servicio de actualización de precios
 * Integrado con Yahoo Finance vía RapidAPI (SteadyAPI)
 */

import axios from 'axios';
import logger from '../config/logger.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'yahoo-finance162.p.rapidapi.com';
const USE_REAL_API = RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here';

/**
 * Obtener precio actual de un símbolo via Yahoo Finance (RapidAPI)
 * @param {string} symbol - Símbolo del activo (ej: AAPL, BTC-USD)
 * @param {string} type - Tipo de activo (stock, crypto, etf)
 * @returns {object|null} Datos del precio o null si falla
 */
export const fetchCurrentPrice = async (symbol, type = 'stock') => {
  if (!USE_REAL_API) {
    logger.debug(`Price fetch requested for ${symbol} (${type}) - MANUAL MODE: API key not configured`);
    return null;
  }

  try {
    // Ajustar símbolo según el tipo
    const adjustedSymbol = adjustSymbolForAPI(symbol, type);

    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}/api/stock/get-price`,
      params: { symbol: adjustedSymbol },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);

    if (response.data && response.data.price) {
      logger.info(`✓ Fetched price for ${symbol}: $${response.data.price}`);
      return {
        symbol: symbol,
        price: response.data.price.regularMarketPrice || response.data.price.postMarketPrice,
        change: response.data.price.regularMarketChange,
        changePercent: response.data.price.regularMarketChangePercent,
        timestamp: new Date(),
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error fetching price for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Obtener precios históricos
 * @param {string} symbol - Símbolo del activo
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Array|null} Array de precios históricos o null
 */
export const fetchHistoricalPrices = async (symbol, startDate, endDate) => {
  if (!USE_REAL_API) {
    logger.debug(`Historical prices requested for ${symbol} - MANUAL MODE: API key not configured`);
    return null;
  }

  try {
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);

    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}/api/stock/get-historical-data`,
      params: {
        symbol: symbol,
        period1: start,
        period2: end,
        interval: '1d', // daily
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);

    if (response.data && response.data.prices) {
      const prices = response.data.prices.map((price) => ({
        date: new Date(price.date * 1000),
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
        volume: price.volume,
      }));

      logger.info(`✓ Fetched ${prices.length} historical prices for ${symbol}`);
      return prices;
    }

    return null;
  } catch (error) {
    logger.error(`Error fetching historical prices for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Actualizar precios de múltiples assets
 * @param {Array} assets - Array de assets a actualizar
 * @returns {object} Resumen de la actualización
 */
export const updateAssetsPrices = async (assets) => {
  if (!USE_REAL_API) {
    logger.debug(`Bulk price update requested for ${assets.length} assets - MANUAL MODE: skipping`);
    return {
      updated: 0,
      failed: 0,
      message: 'Manual mode active - Configure RAPIDAPI_KEY to enable automatic price updates',
    };
  }

  let updated = 0;
  let failed = 0;

  for (const asset of assets) {
    try {
      const priceData = await fetchCurrentPrice(asset.symbol, asset.type);

      if (priceData && priceData.price) {
        // Actualizar el asset con el nuevo precio
        asset.currentPrice = priceData.price;
        asset.lastPriceUpdate = new Date();
        await asset.save();
        updated++;
        logger.info(`✓ Updated price for ${asset.symbol}: $${priceData.price}`);
      } else {
        failed++;
        logger.warn(`✗ Could not fetch price for ${asset.symbol}`);
      }

      // Rate limiting: esperar 200ms entre requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      failed++;
      logger.error(`✗ Error updating ${asset.symbol}:`, error.message);
    }
  }

  return {
    updated,
    failed,
    message: `Updated ${updated} assets, ${failed} failed`,
  };
};

/**
 * Validar si un símbolo existe en Yahoo Finance
 * @param {string} symbol - Símbolo a validar
 * @returns {boolean} true si existe, false si no
 */
export const validateSymbol = async (symbol) => {
  if (!USE_REAL_API) {
    logger.debug(`Symbol validation requested for ${symbol} - MANUAL MODE: returning true`);
    return true; // En modo manual, aceptamos cualquier símbolo
  }

  try {
    const priceData = await fetchCurrentPrice(symbol);
    return priceData !== null;
  } catch (error) {
    logger.error(`Error validating symbol ${symbol}:`, error.message);
    return false;
  }
};

/**
 * Ajustar símbolo según el tipo de activo para la API
 * @param {string} symbol - Símbolo original
 * @param {string} type - Tipo de activo
 * @returns {string} Símbolo ajustado
 */
function adjustSymbolForAPI(symbol, type) {
  // Para crypto, agregar sufijo -USD si no lo tiene
  if (type === 'crypto') {
    if (!symbol.includes('-USD') && !symbol.includes('USDT')) {
      return `${symbol}-USD`;
    }
  }

  return symbol;
}

/**
 * Obtener quote completo de un símbolo
 * @param {string} symbol - Símbolo del activo
 * @returns {object|null} Quote completo o null
 */
export const fetchFullQuote = async (symbol) => {
  if (!USE_REAL_API) {
    return null;
  }

  try {
    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}/api/stock/get-detail`,
      params: { symbol },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching full quote for ${symbol}:`, error.message);
    return null;
  }
};

export default {
  fetchCurrentPrice,
  fetchHistoricalPrices,
  updateAssetsPrices,
  validateSymbol,
  fetchFullQuote,
};
