import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format currency value
 * @param {number} value - The value to format
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @param {boolean} compact - Whether to use compact notation (K, M, B)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD', compact = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }

  if (compact) {
    return formatCompactCurrency(value, currency);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format currency in compact notation (1.2K, 3.5M, etc.)
 */
export const formatCompactCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || isNaN(value)) {
    return `${getCurrencySymbol(currency)}0`;
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const symbol = getCurrencySymbol(currency);

  if (absValue >= 1000000000) {
    return `${sign}${symbol}${(absValue / 1000000000).toFixed(1)}B`;
  } else if (absValue >= 1000000) {
    return `${sign}${symbol}${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `${sign}${symbol}${(absValue / 1000).toFixed(1)}K`;
  } else {
    return `${sign}${symbol}${absValue.toFixed(2)}`;
  }
};

/**
 * Format percentage value
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousands separator
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format date
 * @param {string|Date} date - The date to format
 * @param {string} formatString - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date with time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'HH:mm')}`;
    } else if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'HH:mm')}`;
    } else {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '-';
  }
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
  };
  return symbols[currency] || currency;
};

/**
 * Get profit/loss color class
 * @param {number} value - The value to check
 * @returns {string} Tailwind color class
 */
export const getProfitLossColor = (value) => {
  if (value > 0) return 'text-success-600';
  if (value < 0) return 'text-danger-600';
  return 'text-gray-600';
};

/**
 * Get profit/loss background color class
 * @param {number} value - The value to check
 * @returns {string} Tailwind background color class
 */
export const getProfitLossBgColor = (value) => {
  if (value > 0) return 'bg-success-50 text-success-700';
  if (value < 0) return 'bg-danger-50 text-danger-700';
  return 'bg-gray-50 text-gray-700';
};

/**
 * Get profit/loss prefix (+/-)
 * @param {number} value - The value to check
 * @returns {string} Prefix symbol
 */
export const getProfitLossPrefix = (value) => {
  if (value > 0) return '+';
  if (value < 0) return '';
  return '';
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
