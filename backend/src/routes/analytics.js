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

/**
 * @route   GET /api/v1/analytics/risk-metrics
 * @desc    Obtener métricas de riesgo del portfolio
 * @access  Public
 */
router.get('/risk-metrics', analyticsController.getRiskMetrics);

/**
 * @route   GET /api/v1/analytics/benchmarks
 * @desc    Obtener benchmarks disponibles
 * @access  Public
 */
router.get('/benchmarks', analyticsController.getAvailableBenchmarks);

/**
 * @route   GET /api/v1/analytics/recommended-benchmark
 * @desc    Obtener benchmark recomendado
 * @access  Public
 */
router.get('/recommended-benchmark', analyticsController.getRecommendedBenchmark);

/**
 * @route   GET /api/v1/analytics/benchmark/:symbol
 * @desc    Comparar portfolio con un benchmark específico
 * @access  Public
 */
router.get('/benchmark/:symbol', analyticsController.compareWithBenchmark);

export default router;
