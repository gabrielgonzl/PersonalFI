/**
 * Servicio de actualización de precios (Yahoo Finance)
 * NOTA: Preparado para futuro - de momento TODO es MANUAL
 */

import logger from '../config/logger.js';

/**
 * Obtener precio actual de un símbolo (FUTURO - Yahoo Finance)
 * De momento retorna null para indicar que se use precio manual
 */
export const fetchCurrentPrice = async (symbol, type = 'stock') => {
  // TODO: Implementar integración con Yahoo Finance en el futuro
  // Por ahora, todo es manual
  logger.debug(`Price fetch requested for ${symbol} (${type}) - MANUAL MODE: returning null`);
  return null;
};

/**
 * Obtener precios históricos (FUTURO)
 */
export const fetchHistoricalPrices = async (symbol, startDate, endDate) => {
  logger.debug(`Historical prices requested for ${symbol} - MANUAL MODE: returning null`);
  return null;
};

/**
 * Actualizar precios de múltiples assets (FUTURO)
 */
export const updateAssetsPrices = async (assets) => {
  logger.debug(`Bulk price update requested for ${assets.length} assets - MANUAL MODE: skipping`);
  return {
    updated: 0,
    failed: 0,
    message: 'Manual mode active - prices must be updated manually',
  };
};

/**
 * Validar si un símbolo existe en Yahoo Finance (FUTURO)
 */
export const validateSymbol = async (symbol) => {
  logger.debug(`Symbol validation requested for ${symbol} - MANUAL MODE: returning true`);
  return true; // En modo manual, aceptamos cualquier símbolo
};

// Estructura para cuando se implemente Yahoo Finance:
/*
import axios from 'axios';

const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance';

export const fetchCurrentPrice = async (symbol, type = 'stock') => {
  try {
    const url = `${YAHOO_FINANCE_BASE}/quote?symbols=${symbol}`;
    const response = await axios.get(url);

    if (response.data?.quoteResponse?.result?.[0]) {
      const quote = response.data.quoteResponse.result[0];
      return {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        timestamp: new Date(quote.regularMarketTime * 1000),
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error fetching price for ${symbol}:`, error.message);
    return null;
  }
};
*/

export default {
  fetchCurrentPrice,
  fetchHistoricalPrices,
  updateAssetsPrices,
  validateSymbol,
};
