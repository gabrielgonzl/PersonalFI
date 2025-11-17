/**
 * Controlador para Assets
 */

import assetService from '../services/assetService.js';
import contributionService from '../services/contributionService.js';
import analyticsService from '../services/analyticsService.js';
import { successResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

class AssetController {
  /**
   * GET /assets
   */
  async getAllAssets(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        portfolioId: req.query.portfolioId,
        sortBy: req.query.sortBy,
        order: req.query.order,
      };

      const assets = await assetService.getAllAssets(filters);

      res.json({
        success: true,
        count: assets.length,
        data: assets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /assets/:id
   */
  async getAssetById(req, res, next) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.json(successResponse(asset));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /assets
   */
  async createAsset(req, res, next) {
    try {
      const asset = await assetService.createAsset(req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(asset));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /assets/:id
   */
  async updateAsset(req, res, next) {
    try {
      const asset = await assetService.updateAsset(req.params.id, req.body);
      res.json(successResponse(asset));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /assets/:id
   */
  async deleteAsset(req, res, next) {
    try {
      const result = await assetService.deleteAsset(req.params.id);
      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /assets/:id/update-price
   */
  async updatePrice(req, res, next) {
    try {
      // Aceptar currentPrice, price, o newPrice para mayor flexibilidad
      const price = req.body.currentPrice ?? req.body.price ?? req.body.newPrice;
      const asset = await assetService.updatePrice(req.params.id, price);
      res.json(successResponse(asset));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /assets/:id/contributions
   */
  async getAssetContributions(req, res, next) {
    try {
      const filters = {
        assetId: req.params.id,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
      };

      const result = await contributionService.getAllContributions(filters, pagination);

      res.json({
        success: true,
        count: result.contributions.length,
        pagination: result.pagination,
        data: result.contributions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /assets/:id/performance
   */
  async getAssetPerformance(req, res, next) {
    try {
      const period = req.query.period || 'all';

      const performance = await analyticsService.getAssetPerformance(req.params.id, period);

      res.json(successResponse(performance));
    } catch (error) {
      next(error);
    }
  }
}

export default new AssetController();
