// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Growing';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Asset Types
export const ASSET_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'stock',
  ETF: 'etf',
  FUND: 'fund',
  BOND: 'bond',
  COMMODITY: 'commodity',
  REAL_ESTATE: 'real_estate',
  OTHER: 'other',
};

export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.CRYPTO]: 'Criptomoneda',
  [ASSET_TYPES.STOCK]: 'Acción',
  [ASSET_TYPES.ETF]: 'ETF',
  [ASSET_TYPES.FUND]: 'Fondo',
  [ASSET_TYPES.BOND]: 'Bono',
  [ASSET_TYPES.COMMODITY]: 'Commodity',
  [ASSET_TYPES.REAL_ESTATE]: 'Bienes Raíces',
  [ASSET_TYPES.OTHER]: 'Otro',
};

// Contribution Types
export const CONTRIBUTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
};

export const CONTRIBUTION_TYPE_LABELS = {
  [CONTRIBUTION_TYPES.BUY]: 'Compra',
  [CONTRIBUTION_TYPES.SELL]: 'Venta',
  [CONTRIBUTION_TYPES.TRANSFER_IN]: 'Transferencia Entrante',
  [CONTRIBUTION_TYPES.TRANSFER_OUT]: 'Transferencia Saliente',
};

// Currencies
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

// Date Ranges
export const DATE_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  YEAR: 'year',
  ALL: 'all',
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.TODAY]: 'Hoy',
  [DATE_RANGES.WEEK]: '1 Semana',
  [DATE_RANGES.MONTH]: '1 Mes',
  [DATE_RANGES.THREE_MONTHS]: '3 Meses',
  [DATE_RANGES.SIX_MONTHS]: '6 Meses',
  [DATE_RANGES.YEAR]: '1 Año',
  [DATE_RANGES.ALL]: 'Todo el Tiempo',
};

// Chart Types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area',
  DONUT: 'donut',
};

// Color Palette for Charts
export const CHART_COLORS = [
  '#0ea5e9', // primary-500
  '#22c55e', // success-500
  '#f59e0b', // warning-500
  '#ef4444', // danger-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Query Configuration
export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const QUERY_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'growing_theme',
  LANGUAGE: 'growing_language',
  CURRENCY: 'growing_currency',
  SIDEBAR_COLLAPSED: 'growing_sidebar_collapsed',
};

// Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
};

export const LANGUAGE_LABELS = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.FR]: 'Français',
  [LANGUAGES.DE]: 'Deutsch',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// API Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
