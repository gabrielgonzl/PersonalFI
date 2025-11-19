/**
 * Servicio de lógica de negocio para Contributions
 */

import mongoose from 'mongoose';
import { Contribution, Asset, Portfolio } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';
import logger from '../config/logger.js';
import assetService from './assetService.js';

class ContributionService {
  /**
   * Obtener todas las contribuciones con filtros
   */
  async getAllContributions(filters = {}, pagination = {}) {
    const query = {};

    if (filters.assetId) query.assetId = filters.assetId;
    if (filters.type) query.type = filters.type;

    // Filtro por rango de fechas
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const [contributions, total] = await Promise.all([
      Contribution.find(query)
        .populate('assetId', 'name symbol type')
        .sort({ date: -1 })
        .limit(limit)
        .skip(skip),
      Contribution.countDocuments(query),
    ]);

    return {
      contributions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una contribución por ID
   */
  async getContributionById(id) {
    const contribution = await Contribution.findById(id).populate('assetId', 'name symbol type currentPrice');

    if (!contribution) {
      throw new AppError('Contribution no encontrada', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return contribution;
  }

  /**
   * Crear nueva contribución
   * CORRECCIÓN: Usando transacciones MongoDB para mantener consistencia de datos
   */
  async createContribution(data) {
    // Validar que el asset existe
    const asset = await Asset.findById(data.assetId);
    if (!asset) {
      throw new AppError('Asset no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // No permitir contribuciones para assets virtuales (cash o portfolio)
    if (asset.type === 'cash') {
      throw new AppError(
        'No se pueden crear contribuciones para activos de tipo "cash". Use /portfolios/:id/add-cash para agregar efectivo.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (asset.type === 'portfolio') {
      throw new AppError(
        'No se pueden crear contribuciones para activos de tipo "portfolio". Los portfolios se gestionan desde /portfolios',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Validar cantidad disponible para ventas
    if (data.type === 'sell') {
      if (data.quantity > asset.quantity) {
        throw new AppError(
          `Cantidad insuficiente para vender. Disponible: ${asset.quantity}, Intentando vender: ${data.quantity}`,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_CODES.INSUFFICIENT_FUNDS
        );
      }
    }

    // Si el asset pertenece a un portfolio, validar fondos disponibles para compras
    if (data.type === 'buy' && asset.portfolioId) {
      const portfolio = await Portfolio.findById(asset.portfolioId);
      // Calcular totalAmount de la misma forma que el modelo (ver Contribution.js pre-save hook)
      const totalAmount = data.totalAmount || (data.quantity * data.pricePerUnit + (data.fees || 0));

      if (portfolio && totalAmount > portfolio.cashBalance) {
        throw new AppError(
          `Fondos insuficientes en el portfolio. Disponible: ${portfolio.cashBalance}, Requerido: ${totalAmount}`,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_CODES.INSUFFICIENT_FUNDS
        );
      }
    }

    // INICIAR TRANSACCIÓN MONGODB
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Crear la contribución (dentro de la transacción)
      const [contribution] = await Contribution.create([data], { session });

      // Recalcular métricas del asset desde contribuciones
      const stats = await Contribution.getTotalInvested(asset._id);
      asset.totalInvested = stats.netInvested;
      asset.quantity = stats.totalQuantity;
      await asset.save({ session });

      // Si el asset pertenece a un portfolio, actualizar portfolio
      if (asset.portfolioId) {
        const portfolio = await Portfolio.findById(asset.portfolioId).session(session);

        if (portfolio) {
          // Actualizar cash balance según tipo de transacción
          if (contribution.type === 'buy') {
            portfolio.cashBalance -= contribution.totalAmount;
          } else if (contribution.type === 'sell') {
            portfolio.cashBalance += contribution.totalAmount;
          }

          // Recalcular métricas del portfolio
          const metrics = await Portfolio.recalculateMetrics(portfolio._id);
          portfolio.totalInvested = metrics.totalInvested;
          portfolio.currentValue = metrics.currentValue;
          await portfolio.save({ session });
        }
      }

      // COMMIT de la transacción
      await session.commitTransaction();
      logger.info(`Contribution created with transaction: ${contribution.type} ${contribution.quantity} of ${asset.symbol}`);

      return {
        contribution,
        assetUpdated: {
          quantity: asset.quantity,
          totalInvested: asset.totalInvested,
          averagePrice: asset.quantity > 0 ? asset.totalInvested / asset.quantity : 0,
        },
      };
    } catch (error) {
      // ROLLBACK en caso de error
      await session.abortTransaction();
      logger.error(`Transaction aborted during contribution creation: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Actualizar contribución
   */
  async updateContribution(id, updates) {
    const contribution = await Contribution.findById(id);

    if (!contribution) {
      throw new AppError('Contribution no encontrada', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const asset = await Asset.findById(contribution.assetId);
    if (!asset) {
      throw new AppError('Asset asociado no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Guardar valores anteriores para revertir
    const oldContribution = { ...contribution.toObject() };

    // Aplicar actualizaciones
    Object.assign(contribution, updates);
    await contribution.save();

    // Recalcular métricas del asset
    await assetService.recalculateAssetMetrics(asset._id);

    logger.info(`Contribution updated: ${contribution._id}`);
    return contribution;
  }

  /**
   * Eliminar contribución
   * CORRECCIÓN: Usando transacciones MongoDB
   */
  async deleteContribution(id) {
    const contribution = await Contribution.findById(id).populate('assetId');

    if (!contribution) {
      throw new AppError('Contribution no encontrada', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const asset = contribution.assetId;
    if (!asset) {
      throw new AppError('Asset asociado no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // INICIAR TRANSACCIÓN
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Eliminar la contribución
      await Contribution.findByIdAndDelete(id, { session });

      // Recalcular métricas del asset desde las contribuciones restantes
      const stats = await Contribution.getTotalInvested(asset._id);
      asset.totalInvested = stats.netInvested;
      asset.quantity = stats.totalQuantity;
      await asset.save({ session });

      // Si el asset pertenece a un portfolio, restaurar cash balance y recalcular
      if (asset.portfolioId) {
        const portfolio = await Portfolio.findById(asset.portfolioId).session(session);

        if (portfolio) {
          // Revertir el efecto en cash balance
          if (contribution.type === 'buy') {
            portfolio.cashBalance += contribution.totalAmount; // Devolver el efectivo gastado
          } else if (contribution.type === 'sell') {
            portfolio.cashBalance -= contribution.totalAmount; // Quitar el efectivo recibido
          }

          // Recalcular métricas del portfolio
          const metrics = await Portfolio.recalculateMetrics(portfolio._id);
          portfolio.totalInvested = metrics.totalInvested;
          portfolio.currentValue = metrics.currentValue;
          await portfolio.save({ session });
        }
      }

      // COMMIT
      await session.commitTransaction();
      logger.info(`Contribution deleted with transaction: ${id}`);

      return { message: 'Contribution eliminada, asset y portfolio actualizados' };
    } catch (error) {
      // ROLLBACK
      await session.abortTransaction();
      logger.error(`Transaction aborted during contribution deletion: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Actualizar asset cuando se crea/modifica una contribución
   */
  async updateAssetFromContribution(asset, contribution) {
    // Recalcular usando todas las contribuciones
    await assetService.recalculateAssetMetrics(asset._id);

    // Si el asset está en un portfolio, actualizar el portfolio
    if (asset.portfolioId) {
      const portfolio = await Portfolio.findById(asset.portfolioId);
      if (portfolio) {
        // Si es compra, reducir cash balance
        if (contribution.type === 'buy') {
          portfolio.cashBalance -= contribution.totalAmount;
        }
        // Si es venta, aumentar cash balance
        else if (contribution.type === 'sell') {
          portfolio.cashBalance += contribution.totalAmount;
        }

        // Recalcular métricas del portfolio
        const metrics = await Portfolio.recalculateMetrics(portfolio._id);
        portfolio.totalInvested = metrics.totalInvested;
        portfolio.currentValue = metrics.currentValue;
        await portfolio.save();
      }
    }
  }

  /**
   * Obtener estadísticas de contribuciones
   */
  async getContributionStats(filters = {}) {
    const query = {};
    if (filters.assetId) query.assetId = filters.assetId;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const stats = await Contribution.getStats(query);

    return stats;
  }
}

export default new ContributionService();
