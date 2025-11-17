/**
 * Archivo central de rutas
 */

import express from 'express';
import assetRoutes from './assets.js';
import contributionRoutes from './contributions.js';
import portfolioRoutes from './portfolios.js';
import analyticsRoutes from './analytics.js';
import settingsRoutes from './settings.js';
import priceRoutes from './priceRoutes.js';

const router = express.Router();

// Montar rutas con prefijos
router.use('/assets', assetRoutes);
router.use('/contributions', contributionRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/prices', priceRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Growing API is running',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

export default router;
