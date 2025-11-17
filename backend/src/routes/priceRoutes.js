/**
 * Rutas para operaciones de precios
 */

import express from 'express';
import priceController from '../controllers/priceController.js';

const router = express.Router();

// GET /api/prices/info - Obtener información del servicio de precios
router.get('/info', priceController.getServiceInfo);

// GET /api/prices/quote/:symbol - Obtener cotización actual
router.get('/quote/:symbol', priceController.getQuote);

// GET /api/prices/historical/:symbol - Obtener precios históricos
router.get('/historical/:symbol', priceController.getHistorical);

// GET /api/prices/search - Buscar símbolos
router.get('/search', priceController.searchSymbols);

// POST /api/prices/update-all - Actualizar todos los precios
router.post('/update-all', priceController.updateAllPrices);

// POST /api/prices/update/:assetId - Actualizar precio de un asset
router.post('/update/:assetId', priceController.updateAssetPrice);

// DELETE /api/prices/cache - Limpiar caché
router.delete('/cache', priceController.clearCache);

export default router;
