/**
 * Controlador para Contributions
 */

import contributionService from '../services/contributionService.js';
import { successResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

class ContributionController {
  /**
   * GET /contributions
   */
  async getAllContributions(req, res, next) {
    try {
      const filters = {
        assetId: req.query.assetId,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
      };

      const result = await contributionService.getAllContributions(filters, pagination);

      res.json(
        successResponse({
          count: result.contributions.length,
          pagination: result.pagination,
          data: result.contributions,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /contributions/:id
   */
  async getContributionById(req, res, next) {
    try {
      const contribution = await contributionService.getContributionById(req.params.id);
      res.json(successResponse(contribution));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /contributions
   */
  async createContribution(req, res, next) {
    try {
      const result = await contributionService.createContribution(req.body);

      res.status(HTTP_STATUS.CREATED).json(
        successResponse({
          contribution: result.contribution,
          assetUpdated: result.assetUpdated,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /contributions/:id
   */
  async updateContribution(req, res, next) {
    try {
      const contribution = await contributionService.updateContribution(req.params.id, req.body);
      res.json(successResponse(contribution));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /contributions/:id
   */
  async deleteContribution(req, res, next) {
    try {
      const result = await contributionService.deleteContribution(req.params.id);
      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /contributions/stats
   */
  async getStats(req, res, next) {
    try {
      const filters = {
        assetId: req.query.assetId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const stats = await contributionService.getContributionStats(filters);
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}

export default new ContributionController();
