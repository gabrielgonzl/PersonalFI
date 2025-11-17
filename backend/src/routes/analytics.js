/**
 * Rutas para Analytics
 */

import express from 'express';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Obtener overview del dashboard
 * @access  Public
 */
router.get('/overview', analyticsController.getOverview);

/**
 * @route   GET /api/v1/analytics/performance
 * @desc    Obtener rendimiento histórico
 * @access  Public
 */
router.get('/performance', analyticsController.getPerformance);

/**
 * @route   GET /api/v1/analytics/distribution
 * @desc    Obtener distribución de inversiones
 * @access  Public
 */
router.get('/distribution', analyticsController.getDistribution);

/**
 * @route   GET /api/v1/analytics/timeline
 * @desc    Obtener línea de tiempo de eventos
 * @access  Public
 */
router.get('/timeline', analyticsController.getTimeline);

/**
 * @route   GET /api/v1/analytics/top-performers
 * @desc    Obtener top performers
 * @access  Public
 */
router.get('/top-performers', analyticsController.getTopPerformers);

export default router;
