/**
 * Controlador para operaciones de precios
 */

import priceService from '../utils/priceService.js';
import assetService from '../services/assetService.js';
import { Asset } from '../models/index.js';
import { successResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

class PriceController {
  /**
   * GET /prices/info
   * Obtener información del servicio de precios
   */
  async getServiceInfo(req, res, next) {
    try {
      const info = priceService.getPriceServiceInfo();
      res.json(successResponse(info));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /prices/quote/:symbol
   * Obtener cotización actual de un símbolo
   */
  async getQuote(req, res, next) {
    try {
      const { symbol } = req.params;
      const { type } = req.query;

      const priceData = await priceService.fetchCurrentPrice(symbol, type);

      if (!priceData) {
        return res.json(successResponse(null, 'Price data not available in manual mode or symbol not found'));
      }

      res.json(successResponse(priceData));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /prices/historical/:symbol
   * Obtener precios históricos de un símbolo
   */
  async getHistorical(req, res, next) {
    try {
      const { symbol } = req.params;
      const { startDate, endDate, interval = '1d' } = req.query;

      const historicalData = await priceService.fetchHistoricalPrices(
        symbol,
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 días atrás
        endDate || new Date(),
        interval
      );

      if (!historicalData) {
        return res.json(successResponse(null, 'Historical data not available in manual mode or symbol not found'));
      }

      res.json(successResponse({
        symbol,
        interval,
        count: historicalData.length,
        data: historicalData,
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /prices/search
   * Buscar símbolos por nombre
   */
  async searchSymbols(req, res, next) {
    try {
      const { q: query } = req.query;

      if (!query || query.length < 2) {
        return res.json(successResponse([], 'Query must be at least 2 characters'));
      }

      const results = await priceService.searchSymbols(query);

      res.json(successResponse({
        query,
        count: results.length,
        results,
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /prices/update-all
   * Actualizar precios de todos los assets
   */
  async updateAllPrices(req, res, next) {
    try {
      // Obtener todos los assets (excepto virtuales)
      const assets = await Asset.find({
        type: { $nin: ['cash', 'portfolio'] },
      });

      const results = await priceService.updateAssetsPrices(assets);

      // Si hay assets actualizados, guardar los cambios en BD
      if (results.updated > 0 && results.details) {
        for (const detail of results.details) {
          if (detail.status === 'updated') {
            const asset = assets.find(a => a.symbol === detail.symbol);
            if (asset) {
              await assetService.updatePrice(asset._id, detail.newPrice);
            }
          }
        }
      }

      res.json(successResponse(results, \`Updated \${results.updated} assets\`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /prices/update/:assetId
   * Actualizar precio de un asset específico desde API
   */
  async updateAssetPrice(req, res, next) {
    try {
      const { assetId } = req.params;

      const asset = await assetService.getAssetById(assetId);

      if (!asset.symbol) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Asset does not have a symbol defined',
        });
      }

      const priceData = await priceService.fetchCurrentPrice(asset.symbol, asset.type);

      if (!priceData) {
        return res.json(successResponse(null, 'Price data not available. Check if auto mode is enabled.'));
      }

      // Actualizar precio del asset
      const updatedAsset = await assetService.updatePrice(assetId, priceData.price);

      res.json(successResponse({
        asset: updatedAsset,
        priceData,
      }, \`Price updated: $\${priceData.price}\`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /prices/cache
   * Limpiar caché de precios
   */
  async clearCache(req, res, next) {
    try {
      const result = priceService.clearPriceCache();
      res.json(successResponse(result, 'Cache cleared successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export default new PriceController();
