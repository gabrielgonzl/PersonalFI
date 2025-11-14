/**
 * Controlador para Analytics
 */

import analyticsService from '../services/analyticsService.js';
import { successResponse } from '../utils/helpers.js';

class AnalyticsController {
  /**
   * GET /analytics/overview
   */
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverview();
      res.json(successResponse(overview));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/performance
   */
  async getPerformance(req, res, next) {
    try {
      const period = req.query.period || 'all';
      const granularity = req.query.granularity || 'day';

      const performance = await analyticsService.getPerformance(period, granularity);
      res.json(successResponse(performance));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/distribution
   */
  async getDistribution(req, res, next) {
    try {
      const distribution = await analyticsService.getDistribution();
      res.json(successResponse(distribution));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/timeline
   */
  async getTimeline(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const timeline = await analyticsService.getTimeline(limit);

      res.json(successResponse(timeline));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/top-performers
   */
  async getTopPerformers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || 'percentage';

      const performers = await analyticsService.getTopPerformers(limit, sortBy);
      res.json(successResponse(performers));
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
