import { z } from 'zod';
import { ASSET_TYPES, CONTRIBUTION_TYPES, CURRENCIES } from '../config/constants';

/**
 * Asset validation schema
 */
export const assetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(100, 'Asset name must be less than 100 characters'),

  symbol: z.string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol must be less than 20 characters')
    .toUpperCase(),

  type: z.enum(Object.values(ASSET_TYPES), {
    errorMap: () => ({ message: 'Invalid asset type' }),
  }),

  currency: z.enum(CURRENCIES, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),

  portfolioId: z.string().optional().nullable(),

  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),

  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),

  icon: z.string().max(50).optional(),
});

/**
 * Contribution validation schema
 */
export const contributionSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),

  date: z.string().or(z.date()),

  type: z.enum(Object.values(CONTRIBUTION_TYPES), {
    errorMap: () => ({ message: 'Invalid contribution type' }),
  }),

  quantity: z.number()
    .positive('Quantity must be positive')
    .finite('Quantity must be a valid number'),

  pricePerUnit: z.number()
    .positive('Price must be positive')
    .finite('Price must be a valid number'),

  totalAmount: z.number()
    .positive('Total amount must be positive')
    .finite('Total amount must be a valid number'),

  fees: z.number()
    .min(0, 'Fees cannot be negative')
    .finite('Fees must be a valid number')
    .optional()
    .default(0),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),

  source: z.string()
    .max(100, 'Source must be less than 100 characters')
    .optional(),
});

/**
 * Portfolio validation schema
 */
export const portfolioSchema = z.object({
  name: z.string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  currency: z.enum(CURRENCIES, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),

  cashBalance: z.number()
    .min(0, 'Cash balance cannot be negative')
    .finite('Cash balance must be a valid number')
    .optional()
    .default(0),

  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),

  icon: z.string()
    .max(50)
    .optional(),
});

/**
 * Price update validation schema
 */
export const priceUpdateSchema = z.object({
  currentPrice: z.number()
    .positive('Price must be positive')
    .finite('Price must be a valid number'),
});

/**
 * Add cash validation schema
 */
export const addCashSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .finite('Amount must be a valid number'),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

/**
 * Settings validation schema
 */
export const settingsSchema = z.object({
  defaultCurrency: z.enum(CURRENCIES).optional(),

  language: z.string().optional(),

  theme: z.enum(['light', 'dark', 'auto']).optional(),

  chartType: z.enum(['line', 'bar', 'area']).optional(),

  priceUpdateInterval: z.number()
    .min(5, 'Update interval must be at least 5 minutes')
    .max(1440, 'Update interval cannot exceed 24 hours')
    .optional(),

  notifications: z.object({
    priceAlerts: z.boolean().optional(),
    portfolioRebalance: z.boolean().optional(),
    profitLossThreshold: z.number().optional(),
  }).optional(),
});

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0 && isFinite(value);
};

/**
 * Validate non-negative number
 */
export const isNonNegativeNumber = (value) => {
  return typeof value === 'number' && value >= 0 && isFinite(value);
};

/**
 * Validate date
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate hex color
 */
export const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};
