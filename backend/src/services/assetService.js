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
   * Si se filtra por portfolioId, incluye:
   * - El efectivo del portfolio como un asset virtual
   * - Los sub-portfolios (carteras hijas) como assets virtuales
   */
  async getAllAssets(filters = {}) {
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.portfolioId) query.portfolioId = filters.portfolioId;

    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 1 : -1;

    let assets = await Asset.find(query)
      .populate('portfolioId', 'name color')
      .sort({ [sortBy]: order });

    // Si se filtra por portfolio, agregar assets virtuales
    if (filters.portfolioId) {
      const portfolio = await Portfolio.findById(filters.portfolioId);

      if (portfolio) {
        // Convertir assets a plain objects si es necesario
        assets = assets.map(a => a.toObject ? a.toObject() : a);

        // 1. Buscar sub-portfolios (carteras hijas) de este portfolio
        const subPortfolios = await Portfolio.find({ parentPortfolioId: filters.portfolioId });

        // Agregar cada sub-portfolio como un asset virtual
        for (const subPortfolio of subPortfolios) {
          const portfolioAsset = {
            _id: `portfolio_${subPortfolio._id}`,
            name: subPortfolio.name,
            symbol: subPortfolio.name.substring(0, 10).toUpperCase(),
            type: 'portfolio',
            currency: subPortfolio.currency || 'USD',
            portfolioId: {
              _id: portfolio._id,
              name: portfolio.name,
              color: portfolio.color,
            },
            // Para un portfolio, quantity = 1 (es una unidad)
            quantity: 1,
            currentPrice: subPortfolio.totalValue,
            currentValue: subPortfolio.totalValue,
            totalInvested: subPortfolio.totalInvested,
            averagePrice: subPortfolio.totalValue,
            profitLoss: subPortfolio.profitLoss,
            profitLossPercentage: subPortfolio.profitLossPercentage,
            notes: subPortfolio.description || 'Sub-portfolio',
            color: subPortfolio.color || '#8B5CF6', // Violeta para portfolios
            isPortfolio: true, // Flag para identificarlo como portfolio
            subPortfolioId: subPortfolio._id, // ID real del sub-portfolio
            lastPriceUpdate: subPortfolio.updatedAt,
            createdAt: subPortfolio.createdAt,
            updatedAt: subPortfolio.updatedAt,
          };

          assets.push(portfolioAsset);
        }

        // 2. Agregar el efectivo como asset virtual (si existe)
        if (portfolio.cashBalance > 0) {
          const cashAsset = {
            _id: `cash_${portfolio._id}`,
            name: 'Efectivo',
            symbol: portfolio.currency || 'USD',
            type: 'cash',
            currency: portfolio.currency || 'USD',
            portfolioId: {
              _id: portfolio._id,
              name: portfolio.name,
              color: portfolio.color,
            },
            quantity: portfolio.cashBalance,
            currentPrice: 1,
            currentValue: portfolio.cashBalance,
            totalInvested: portfolio.cashBalance,
            averagePrice: 1,
            profitLoss: 0,
            profitLossPercentage: 0,
            notes: 'Efectivo disponible en el portfolio',
            color: '#10B981', // Verde para cash
            isCash: true, // Flag para identificarlo como cash
            lastPriceUpdate: new Date(),
            createdAt: portfolio.createdAt,
            updatedAt: portfolio.updatedAt,
          };

          // Agregar el cash asset al inicio
          assets.unshift(cashAsset);
        }
      }
    }

    return assets;
  }

  /**
   * Obtener un asset por ID
   * Maneja assets virtuales:
   * - cash_{portfolioId} para efectivo
   * - portfolio_{portfolioId} para sub-portfolios
   */
  async getAssetById(id) {
    // Si el ID es de un asset de cash virtual
    if (typeof id === 'string' && id.startsWith('cash_')) {
      const portfolioId = id.replace('cash_', '');
      const portfolio = await Portfolio.findById(portfolioId);

      if (!portfolio) {
        throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
      }

      // Retornar asset virtual de cash
      return {
        _id: id,
        name: 'Efectivo',
        symbol: portfolio.currency || 'USD',
        type: 'cash',
        currency: portfolio.currency || 'USD',
        portfolioId: {
          _id: portfolio._id,
          name: portfolio.name,
          color: portfolio.color,
          currency: portfolio.currency,
        },
        quantity: portfolio.cashBalance,
        currentPrice: 1,
        currentValue: portfolio.cashBalance,
        totalInvested: portfolio.cashBalance,
        averagePrice: 1,
        profitLoss: 0,
        profitLossPercentage: 0,
        notes: 'Efectivo disponible en el portfolio',
        color: '#10B981',
        isCash: true,
        lastPriceUpdate: new Date(),
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      };
    }

    // Si el ID es de un sub-portfolio virtual
    if (typeof id === 'string' && id.startsWith('portfolio_')) {
      const subPortfolioId = id.replace('portfolio_', '');
      const subPortfolio = await Portfolio.findById(subPortfolioId).populate('parentPortfolioId', 'name color');

      if (!subPortfolio) {
        throw new AppError('Sub-portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
      }

      // Retornar asset virtual de portfolio
      return {
        _id: id,
        name: subPortfolio.name,
        symbol: subPortfolio.name.substring(0, 10).toUpperCase(),
        type: 'portfolio',
        currency: subPortfolio.currency || 'USD',
        portfolioId: subPortfolio.parentPortfolioId ? {
          _id: subPortfolio.parentPortfolioId._id,
          name: subPortfolio.parentPortfolioId.name,
          color: subPortfolio.parentPortfolioId.color,
        } : null,
        quantity: 1,
        currentPrice: subPortfolio.totalValue,
        currentValue: subPortfolio.totalValue,
        totalInvested: subPortfolio.totalInvested,
        averagePrice: subPortfolio.totalValue,
        profitLoss: subPortfolio.profitLoss,
        profitLossPercentage: subPortfolio.profitLossPercentage,
        notes: subPortfolio.description || 'Sub-portfolio',
        color: subPortfolio.color || '#8B5CF6',
        isPortfolio: true,
        subPortfolioId: subPortfolio._id,
        lastPriceUpdate: subPortfolio.updatedAt,
        createdAt: subPortfolio.createdAt,
        updatedAt: subPortfolio.updatedAt,
      };
    }

    // Asset normal
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
    // No permitir actualizar assets virtuales (cash o portfolio)
    if (typeof id === 'string' && id.startsWith('cash_')) {
      throw new AppError(
        'No se pueden actualizar activos de tipo "cash". El efectivo se maneja automáticamente.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (typeof id === 'string' && id.startsWith('portfolio_')) {
      throw new AppError(
        'No se pueden actualizar activos de tipo "portfolio". Edite el portfolio directamente en /portfolios/:id',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

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
    // No permitir actualizar precio de assets virtuales
    if (typeof id === 'string' && id.startsWith('cash_')) {
      throw new AppError(
        'No se puede actualizar el precio del efectivo (siempre es 1).',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (typeof id === 'string' && id.startsWith('portfolio_')) {
      throw new AppError(
        'No se puede actualizar el precio de un portfolio. El valor se calcula automáticamente.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

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
    // No permitir eliminar assets virtuales
    if (typeof id === 'string' && id.startsWith('cash_')) {
      throw new AppError(
        'No se pueden eliminar activos de tipo "cash". El efectivo es parte del portfolio.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (typeof id === 'string' && id.startsWith('portfolio_')) {
      throw new AppError(
        'No se pueden eliminar activos de tipo "portfolio". Elimine el portfolio directamente en /portfolios/:id',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

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
