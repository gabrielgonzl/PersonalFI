/**
 * Validadores personalizados para la aplicación
 */

import mongoose from 'mongoose';
import { ASSET_TYPES, CONTRIBUTION_TYPES, CURRENCIES } from '../config/constants.js';

/**
 * Validar si un string es un ObjectId válido de MongoDB
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

export const isPositive = (value) => {
  return typeof value === 'number' && value > 0;
};

export const isNonNegative = (value) => {
  return typeof value === 'number' && value >= 0;
};

export const isValidAssetType = (type) => {
  return Object.values(ASSET_TYPES).includes(type);
};

export const isValidContributionType = (type) => {
  return Object.values(CONTRIBUTION_TYPES).includes(type);
};

export const isValidCurrency = (currency) => {
  return Object.values(CURRENCIES).includes(currency.toUpperCase());
};

export const isNotFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
};

export const validatePagination = (page, limit, maxLimit = 200) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 50));

  return { page: validPage, limit: validLimit };
};

export default {
  isValidObjectId,
  isValidHexColor,
  isPositive,
  isNonNegative,
  isValidAssetType,
  isValidContributionType,
  isValidCurrency,
  isNotFutureDate,
  validatePagination,
};
