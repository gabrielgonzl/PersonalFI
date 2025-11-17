/**
 * Middleware de validación usando express-validator
 */

import { body, param, query, validationResult } from 'express-validator';
import { HTTP_STATUS, ERROR_CODES, ASSET_TYPES, CONTRIBUTION_TYPES } from '../config/constants.js';
import { errorResponse } from '../utils/helpers.js';

/**
 * Middleware para validar resultados
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Error de validación', HTTP_STATUS.BAD_REQUEST, details)
    );
  }

  next();
};

/**
 * Validaciones para Asset
 */
export const assetValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
    body('symbol').trim().notEmpty().withMessage('El símbolo es requerido').isLength({ max: 20 }).toUpperCase(),
    body('type').isIn(Object.values(ASSET_TYPES)).withMessage('Tipo de activo inválido'),
    body('currency').optional().isLength({ min: 3, max: 3 }).toUpperCase(),
    body('currentPrice').optional().isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
    body('portfolioId').optional().isMongoId().withMessage('Portfolio ID inválido'),
    body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    validate,
  ],

  update: [
    param('id').isMongoId().withMessage('ID de asset inválido'),
    body('name').optional().trim().isLength({ max: 100 }),
    body('currentPrice').optional().isFloat({ min: 0 }),
    body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    validate,
  ],

  updatePrice: [
    param('id').isMongoId().withMessage('ID de asset inválido'),
    body('currentPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0'),
    body('newPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0'),
    body()
      .custom((value) => {
        if (!value.currentPrice && !value.price && !value.newPrice) {
          throw new Error('Se requiere currentPrice, price o newPrice');
        }
        return true;
      }),
    validate,
  ],
};

/**
 * Validaciones para Contribution
 */
export const contributionValidation = {
  create: [
    body('assetId').isMongoId().withMessage('Asset ID inválido'),
    body('date')
      .isISO8601()
      .withMessage('Fecha inválida')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('La fecha no puede ser futura');
        }
        return true;
      }),
    body('type').isIn(Object.values(CONTRIBUTION_TYPES)).withMessage('Tipo de contribución inválido'),
    body('quantity').isFloat({ gt: 0 }).withMessage('La cantidad debe ser mayor a 0'),
    body('pricePerUnit').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
    body('fees').optional().isFloat({ min: 0 }).withMessage('Las comisiones deben ser mayor o igual a 0'),
    validate,
  ],

  update: [
    param('id').isMongoId().withMessage('ID de contribución inválido'),
    body('quantity').optional().isFloat({ gt: 0 }),
    body('pricePerUnit').optional().isFloat({ min: 0 }),
    body('fees').optional().isFloat({ min: 0 }),
    validate,
  ],
};

/**
 * Validaciones para Portfolio
 */
export const portfolioValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('cashBalance').optional().isFloat({ min: 0 }).withMessage('El balance debe ser mayor o igual a 0'),
    body('currency').optional().isLength({ min: 3, max: 3 }).toUpperCase(),
    body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    validate,
  ],

  update: [
    param('id').isMongoId().withMessage('ID de portfolio inválido'),
    body('name').optional().trim().isLength({ max: 100 }),
    body('cashBalance').optional().isFloat({ min: 0 }),
    validate,
  ],

  addCash: [
    param('id').isMongoId().withMessage('ID de portfolio inválido'),
    body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
    validate,
  ],

  distributeCash: [
    param('id').isMongoId().withMessage('ID de portfolio inválido'),
    body('distributions').isArray({ min: 1 }).withMessage('Debe haber al menos una distribución'),
    body('distributions.*.assetId').isMongoId().withMessage('Asset ID inválido'),
    body('distributions.*.amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
    body('distributions.*.pricePerUnit').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
    validate,
  ],
};

/**
 * Validaciones comunes
 */
export const commonValidation = {
  id: [param('id').isMongoId().withMessage('ID inválido'), validate],

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser mayor a 0'),
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Límite debe estar entre 1 y 200'),
    validate,
  ],

  dateRange: [
    query('startDate').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').optional().isISO8601().withMessage('Fecha de fin inválida'),
    validate,
  ],
};

export default {
  validate,
  assetValidation,
  contributionValidation,
  portfolioValidation,
  commonValidation,
};
