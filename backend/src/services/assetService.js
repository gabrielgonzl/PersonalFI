/**
 * Servicio de lógica de negocio para Assets
 */

import { Asset, Contribution, Portfolio } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';
import logger from '../config/logger.js';

class AssetService {
  /**
   * Obtener todos los assets con filtros
   */
  async getAllAssets(filters = {}) {
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.portfolioId) query.portfolioId = filters.portfolioId;

    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 1 : -1;

    const assets = await Asset.find(query)
      .populate('portfolioId', 'name color')
      .sort({ [sortBy]: order });

    return assets;
  }

  /**
   * Obtener un asset por ID
   */
  async getAssetById(id) {
    const asset = await Asset.findById(id).populate('portfolioId', 'name color currency');

    if (!asset) {
      throw new AppError('Asset no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return asset;
  }

  /**
   * Crear nuevo asset
   */
  async createAsset(data) {
    // Si tiene portfolioId, validar que existe
    if (data.portfolioId) {
      const portfolio = await Portfolio.findById(data.portfolioId);
      if (!portfolio) {
        throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
      }
    }

    const asset = await Asset.create(data);
    logger.info(`Asset created: ${asset.name} (${asset.symbol})`);

    return asset;
  }

  /**
   * Actualizar asset
   */
  async updateAsset(id, updates) {
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError('Asset no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Si se actualiza portfolioId, validar
    if (updates.portfolioId) {
      const portfolio = await Portfolio.findById(updates.portfolioId);
      if (!portfolio) {
        throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
      }
    }

    Object.assign(asset, updates);
    await asset.save();

    logger.info(`Asset updated: ${asset.name} (${asset._id})`);
    return asset;
  }

  /**
   * Actualizar precio de un asset
   */
  async updatePrice(id, newPrice) {
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError('Asset no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    asset.currentPrice = newPrice;
    asset.lastPriceUpdate = new Date();
    await asset.save();

    // Si el asset pertenece a un portfolio, actualizar métricas del portfolio
    if (asset.portfolioId) {
      await this.updatePortfolioMetrics(asset.portfolioId);
    }

    logger.info(`Price updated for ${asset.name}: ${newPrice}`);
    return asset;
  }

  /**
   * Eliminar asset
   */
  async deleteAsset(id) {
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError('Asset no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const portfolioId = asset.portfolioId;

    // Eliminar todas las contribuciones asociadas
    const contributionsDeleted = await Contribution.deleteMany({ assetId: id });

    // Eliminar el asset
    await Asset.findByIdAndDelete(id);

    // Si pertenecía a un portfolio, actualizar métricas
    if (portfolioId) {
      await this.updatePortfolioMetrics(portfolioId);
    }

    logger.info(`Asset deleted: ${asset.name}, ${contributionsDeleted.deletedCount} contributions removed`);

    return {
      message: `Asset y ${contributionsDeleted.deletedCount} contributions eliminados exitosamente`,
    };
  }

  /**
   * Recalcular métricas de un asset basado en sus contribuciones
   */
  async recalculateAssetMetrics(assetId) {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new AppError('Asset no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const stats = await Contribution.getTotalInvested(assetId);

    asset.totalInvested = stats.netInvested;
    asset.quantity = stats.totalQuantity;
    await asset.save();

    logger.debug(`Metrics recalculated for asset ${assetId}`);
    return asset;
  }

  /**
   * Actualizar métricas de portfolio (helper)
   */
  async updatePortfolioMetrics(portfolioId) {
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) return;

    const metrics = await Portfolio.recalculateMetrics(portfolioId);
    portfolio.totalInvested = metrics.totalInvested;
    portfolio.currentValue = metrics.currentValue;
    await portfolio.save();

    logger.debug(`Portfolio metrics updated for ${portfolioId}`);
  }
}

export default new AssetService();
