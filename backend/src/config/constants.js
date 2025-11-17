/**
 * Constantes globales de la aplicación
 */

export const ASSET_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'stock',
  ETF: 'etf',
  FUND: 'fund',
  CASH: 'cash',
  OTHER: 'other',
};

export const CONTRIBUTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  TRANSFER: 'transfer',
};

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CHF: 'CHF',
  CAD: 'CAD',
  AUD: 'AUD',
  BTC: 'BTC',
  ETH: 'ETH',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

export const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  CANDLESTICK: 'candlestick',
};

export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  PT: 'pt',
};

export const PRICE_API_PROVIDERS = {
  COINGECKO: 'coingecko',
  ALPHAVANTAGE: 'alphavantage',
  YAHOOFINANCE: 'yahoofinance',
  MANUAL: 'manual',
};

export const TIME_PERIODS = {
  '7D': '7d',
  '1M': '1m',
  '3M': '3m',
  '6M': '6m',
  '1Y': '1y',
  ALL: 'all',
};

export const REBALANCE_STRATEGIES = {
  PROPORTIONAL: 'proportional',
  MINIMIZE_TRANSACTIONS: 'minimize_transactions',
};

// Límites y configuración
export const LIMITS = {
  MAX_PRICE_UPDATE_INTERVAL: 1440, // 24 horas en minutos
  MIN_PRICE_UPDATE_INTERVAL: 5, // 5 minutos
  DEFAULT_PRICE_UPDATE_INTERVAL: 15, // 15 minutos

  MAX_CONTRIBUTION_NOTES_LENGTH: 500,
  MAX_ASSET_NAME_LENGTH: 100,
  MAX_PORTFOLIO_NAME_LENGTH: 100,

  DEFAULT_PAGINATION_LIMIT: 50,
  MAX_PAGINATION_LIMIT: 200,
};

// Códigos de error
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Configuración de rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};

export default {
  ASSET_TYPES,
  CONTRIBUTION_TYPES,
  CURRENCIES,
  THEMES,
  CHART_TYPES,
  LANGUAGES,
  PRICE_API_PROVIDERS,
  TIME_PERIODS,
  REBALANCE_STRATEGIES,
  LIMITS,
  ERROR_CODES,
  HTTP_STATUS,
  RATE_LIMIT,
};
