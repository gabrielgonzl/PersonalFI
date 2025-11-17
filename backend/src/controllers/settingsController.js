/**
 * Controlador para Settings
 */

import { Settings } from '../models/index.js';
import { successResponse } from '../utils/helpers.js';

class SettingsController {
  /**
   * GET /settings
   */
  async getSettings(req, res, next) {
    try {
      const settings = await Settings.getInstance();
      res.json(successResponse(settings));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /settings
   */
  async updateSettings(req, res, next) {
    try {
      const settings = await Settings.updateSettings(req.body);
      res.json(successResponse(settings, 'Configuración actualizada'));
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
