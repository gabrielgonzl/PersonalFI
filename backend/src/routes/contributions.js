/**
 * Rutas para Contributions
 */

import express from 'express';
import contributionController from '../controllers/contributionController.js';
import { contributionValidation, commonValidation } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/v1/contributions/stats
 * @desc    Obtener estadísticas de contribuciones
 * @access  Public
 */
router.get('/stats', contributionController.getStats);

/**
 * @route   GET /api/v1/contributions
 * @desc    Obtener todas las contribuciones
 * @access  Public
 */
router.get('/', contributionController.getAllContributions);

/**
 * @route   GET /api/v1/contributions/:id
 * @desc    Obtener una contribución específica
 * @access  Public
 */
router.get('/:id', commonValidation.id, contributionController.getContributionById);

/**
 * @route   POST /api/v1/contributions
 * @desc    Crear nueva contribución
 * @access  Public
 */
router.post('/', contributionValidation.create, contributionController.createContribution);

/**
 * @route   PUT /api/v1/contributions/:id
 * @desc    Actualizar contribución
 * @access  Public
 */
router.put('/:id', contributionValidation.update, contributionController.updateContribution);

/**
 * @route   DELETE /api/v1/contributions/:id
 * @desc    Eliminar contribución
 * @access  Public
 */
router.delete('/:id', commonValidation.id, contributionController.deleteContribution);

export default router;
