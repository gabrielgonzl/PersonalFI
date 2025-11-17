/**
 * Controlador para Portfolios
 */

import portfolioService from '../services/portfolioService.js';
import { successResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

class PortfolioController {
  /**
   * GET /portfolios
   */
  async getAllPortfolios(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const portfolios = await portfolioService.getAllPortfolios(includeInactive);

      res.json({
        success: true,
        count: portfolios.length,
        data: portfolios,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /portfolios/:id
   */
  async getPortfolioById(req, res, next) {
    try {
      const includeAssets = req.query.includeAssets === 'true';
      const portfolio = await portfolioService.getPortfolioById(req.params.id, includeAssets);

      res.json(successResponse(portfolio));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /portfolios
   */
  async createPortfolio(req, res, next) {
    try {
      const portfolio = await portfolioService.createPortfolio(req.body);
      res.status(HTTP_STATUS.CREATED).json(successResponse(portfolio));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /portfolios/:id
   */
  async updatePortfolio(req, res, next) {
    try {
      const portfolio = await portfolioService.updatePortfolio(req.params.id, req.body);
      res.json(successResponse(portfolio));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /portfolios/:id
   */
  async deletePortfolio(req, res, next) {
    try {
      const result = await portfolioService.deletePortfolio(req.params.id);
      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /portfolios/:id/add-cash
   */
  async addCash(req, res, next) {
    try {
      const { amount, notes } = req.body;
      const portfolio = await portfolioService.addCash(req.params.id, amount, notes);

      res.json(successResponse(portfolio, `Efectivo agregado: $${amount}`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /portfolios/:id/distribute-cash
   */
  async distributeCash(req, res, next) {
    try {
      const { distributions, notes } = req.body;
      const result = await portfolioService.distributeCash(req.params.id, distributions, notes);

      res.json(successResponse(result, 'Efectivo distribuido exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /portfolios/:id/allocation
   */
  async getAllocation(req, res, next) {
    try {
      const allocation = await portfolioService.getAllocation(req.params.id);
      res.json(successResponse(allocation));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /portfolios/:id/rebalance
   */
  async rebalance(req, res, next) {
    try {
      const { strategy = 'proportional', useCash = true } = req.body;
      const result = await portfolioService.rebalance(req.params.id, strategy, useCash);

      res.json(successResponse(result, 'Portfolio rebalanceado'));
    } catch (error) {
      next(error);
    }
  }
}

export default new PortfolioController();
