/**
 * Rutas para Assets
 */

import express from 'express';
import assetController from '../controllers/assetController.js';
import { assetValidation, commonValidation } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/v1/assets
 * @desc    Obtener todos los assets
 * @access  Public
 */
router.get('/', assetController.getAllAssets);

/**
 * @route   GET /api/v1/assets/:id
 * @desc    Obtener un asset específico
 * @access  Public
 */
router.get('/:id', commonValidation.id, assetController.getAssetById);

/**
 * @route   POST /api/v1/assets
 * @desc    Crear nuevo asset
 * @access  Public
 */
router.post('/', assetValidation.create, assetController.createAsset);

/**
 * @route   PUT /api/v1/assets/:id
 * @desc    Actualizar asset
 * @access  Public
 */
router.put('/:id', assetValidation.update, assetController.updateAsset);

/**
 * @route   DELETE /api/v1/assets/:id
 * @desc    Eliminar asset
 * @access  Public
 */
router.delete('/:id', commonValidation.id, assetController.deleteAsset);

/**
 * @route   POST /api/v1/assets/:id/update-price
 * @desc    Actualizar precio actual del asset
 * @access  Public
 */
router.post('/:id/update-price', assetValidation.updatePrice, assetController.updatePrice);

/**
 * @route   GET /api/v1/assets/:id/contributions
 * @desc    Obtener contribuciones de un asset
 * @access  Public
 */
router.get('/:id/contributions', commonValidation.id, assetController.getAssetContributions);

/**
 * @route   GET /api/v1/assets/:id/performance
 * @desc    Obtener métricas de rendimiento de un asset
 * @access  Public
 */
router.get('/:id/performance', commonValidation.id, assetController.getAssetPerformance);

export default router;
