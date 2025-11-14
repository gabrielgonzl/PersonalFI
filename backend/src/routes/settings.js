/**
 * Rutas para Settings
 */

import express from 'express';
import settingsController from '../controllers/settingsController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/settings
 * @desc    Obtener configuración actual
 * @access  Public
 */
router.get('/', settingsController.getSettings);

/**
 * @route   PUT /api/v1/settings
 * @desc    Actualizar configuración
 * @access  Public
 */
router.put('/', settingsController.updateSettings);

export default router;
