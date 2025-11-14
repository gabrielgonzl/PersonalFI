/**
 * Rutas para Portfolios
 */

import express from 'express';
import portfolioController from '../controllers/portfolioController.js';
import { portfolioValidation, commonValidation } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/v1/portfolios
 * @desc    Obtener todos los portfolios
 * @access  Public
 */
router.get('/', portfolioController.getAllPortfolios);

/**
 * @route   GET /api/v1/portfolios/:id
 * @desc    Obtener un portfolio específico
 * @access  Public
 */
router.get('/:id', commonValidation.id, portfolioController.getPortfolioById);

/**
 * @route   POST /api/v1/portfolios
 * @desc    Crear nuevo portfolio
 * @access  Public
 */
router.post('/', portfolioValidation.create, portfolioController.createPortfolio);

/**
 * @route   PUT /api/v1/portfolios/:id
 * @desc    Actualizar portfolio
 * @access  Public
 */
router.put('/:id', portfolioValidation.update, portfolioController.updatePortfolio);

/**
 * @route   DELETE /api/v1/portfolios/:id
 * @desc    Eliminar portfolio
 * @access  Public
 */
router.delete('/:id', commonValidation.id, portfolioController.deletePortfolio);

/**
 * @route   POST /api/v1/portfolios/:id/add-cash
 * @desc    Agregar efectivo al portfolio
 * @access  Public
 */
router.post('/:id/add-cash', portfolioValidation.addCash, portfolioController.addCash);

/**
 * @route   POST /api/v1/portfolios/:id/distribute-cash
 * @desc    Distribuir efectivo entre assets
 * @access  Public
 */
router.post('/:id/distribute-cash', portfolioValidation.distributeCash, portfolioController.distributeCash);

/**
 * @route   GET /api/v1/portfolios/:id/allocation
 * @desc    Obtener distribución del portfolio
 * @access  Public
 */
router.get('/:id/allocation', commonValidation.id, portfolioController.getAllocation);

/**
 * @route   POST /api/v1/portfolios/:id/rebalance
 * @desc    Rebalancear portfolio
 * @access  Public
 */
router.post('/:id/rebalance', commonValidation.id, portfolioController.rebalance);

export default router;
