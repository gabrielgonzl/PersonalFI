/**
 * Servicio de lógica de negocio para Portfolios
 */

import { Portfolio, Asset, Contribution } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';
import logger from '../config/logger.js';
import { calculateAllocation, calculateRebalanceNeeds } from '../utils/calculations.js';

class PortfolioService {
  /**
   * Obtener todos los portfolios
   */
  async getAllPortfolios(includeInactive = false) {
    const portfolios = await Portfolio.getAllWithMetrics(includeInactive);
    return portfolios;
  }

  /**
   * Obtener portfolio por ID con opción de incluir assets
   */
  async getPortfolioById(id, includeAssets = false) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    if (includeAssets) {
      const assets = await Asset.find({ portfolioId: id });
      const allocation = calculateAllocation(assets, portfolio.cashBalance);

      return {
        ...portfolio.toObject(),
        assets,
        allocation,
      };
    }

    return portfolio;
  }

  /**
   * Crear nuevo portfolio
   */
  async createPortfolio(data) {
    const portfolio = await Portfolio.create(data);

    logger.info(`Portfolio created: ${portfolio.name}`);
    return portfolio;
  }

  /**
   * Actualizar portfolio
   */
  async updatePortfolio(id, updates) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Si se actualiza targetAllocation, validar
    if (updates.targetAllocation) {
      // Validar que los assets existen y pertenecen al portfolio
      for (const allocation of updates.targetAllocation) {
        const asset = await Asset.findOne({ _id: allocation.assetId, portfolioId: id });
        if (!asset) {
          throw new AppError(
            `Asset ${allocation.assetId} no encontrado o no pertenece a este portfolio`,
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
          );
        }
      }
    }

    Object.assign(portfolio, updates);
    await portfolio.save();

    // Validar targetAllocation si existe
    if (portfolio.targetAllocation && portfolio.targetAllocation.length > 0) {
      const validation = portfolio.validateTargetAllocation();
      if (!validation.isValid) {
        logger.warn(`Target allocation validation warning: ${validation.message}`);
      }
    }

    logger.info(`Portfolio updated: ${portfolio.name}`);
    return portfolio;
  }

  /**
   * Eliminar portfolio
   */
  async deletePortfolio(id) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Desvincular assets (no eliminarlos)
    const result = await Asset.updateMany({ portfolioId: id }, { $set: { portfolioId: null } });

    // Eliminar el portfolio
    await Portfolio.findByIdAndDelete(id);

    logger.info(`Portfolio deleted: ${portfolio.name}, ${result.modifiedCount} assets unlinked`);

    return {
      message: `Portfolio eliminado, ${result.modifiedCount} assets desvinculados`,
    };
  }

  /**
   * Agregar efectivo al portfolio
   */
  async addCash(id, amount, notes = null) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    await portfolio.addCash(amount);

    logger.info(`Cash added to portfolio ${portfolio.name}: ${amount}`);

    return portfolio;
  }

  /**
   * Distribuir efectivo entre assets del portfolio
   */
  async distributeCash(id, distributions, notes = null) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Calcular total a distribuir
    const totalAmount = distributions.reduce((sum, dist) => sum + dist.amount, 0);

    // Validar que hay suficiente efectivo
    if (totalAmount > portfolio.cashBalance) {
      throw new AppError(
        `Fondos insuficientes. Disponible: ${portfolio.cashBalance}, Requerido: ${totalAmount}`,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        ERROR_CODES.INSUFFICIENT_FUNDS
      );
    }

    // Validar que todos los assets pertenecen al portfolio
    const assetIds = distributions.map((d) => d.assetId);
    const assets = await Asset.find({ _id: { $in: assetIds }, portfolioId: id });

    if (assets.length !== assetIds.length) {
      throw new AppError(
        'Algunos assets no pertenecen a este portfolio',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Crear contribuciones y actualizar assets
    const contributionsCreated = [];
    const assetsUpdated = [];

    for (const dist of distributions) {
      const asset = assets.find((a) => a._id.toString() === dist.assetId.toString());

      // Calcular cantidad basada en el precio
      const quantity = dist.amount / dist.pricePerUnit;

      // Crear contribución
      const contribution = await Contribution.create({
        assetId: dist.assetId,
        date: new Date(),
        type: 'buy',
        quantity,
        pricePerUnit: dist.pricePerUnit,
        totalAmount: dist.amount,
        fees: dist.fees || 0,
        notes: notes || 'Distribución de efectivo desde portfolio',
      });

      contributionsCreated.push(contribution);

      // Actualizar asset
      asset.quantity += quantity;
      asset.totalInvested += dist.amount;
      await asset.save();

      assetsUpdated.push({
        assetId: asset._id,
        assetName: asset.name,
        newQuantity: asset.quantity,
        newTotalInvested: asset.totalInvested,
      });
    }

    // Reducir cash balance del portfolio
    portfolio.cashBalance -= totalAmount;

    // Recalcular métricas del portfolio
    const metrics = await Portfolio.recalculateMetrics(id);
    portfolio.totalInvested = metrics.totalInvested;
    portfolio.currentValue = metrics.currentValue;
    await portfolio.save();

    logger.info(`Cash distributed in portfolio ${portfolio.name}: ${totalAmount} to ${distributions.length} assets`);

    return {
      portfolioId: portfolio._id,
      previousCashBalance: portfolio.cashBalance + totalAmount,
      newCashBalance: portfolio.cashBalance,
      distributedAmount: totalAmount,
      contributionsCreated: contributionsCreated.length,
      assetsUpdated,
    };
  }

  /**
   * Obtener distribución (allocation) del portfolio
   */
  async getAllocation(id) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const allocationData = await Portfolio.getAllocation(id);

    // Si hay target allocation, calcular diferencias
    let rebalanceNeeds = null;
    if (portfolio.targetAllocation && portfolio.targetAllocation.length > 0) {
      rebalanceNeeds = calculateRebalanceNeeds(allocationData.allocation, portfolio.targetAllocation);
    }

    return {
      ...allocationData,
      targetAllocation: portfolio.targetAllocation,
      rebalanceNeeds,
    };
  }

  /**
   * Rebalancear portfolio según target allocation (simplificado)
   */
  async rebalance(id, strategy = 'proportional', useCash = true) {
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      throw new AppError('Portfolio no encontrado', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    if (!portfolio.targetAllocation || portfolio.targetAllocation.length === 0) {
      throw new AppError(
        'No hay target allocation definido para este portfolio',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Validar target allocation
    const validation = portfolio.validateTargetAllocation();
    if (!validation.isValid) {
      throw new AppError(validation.message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    const allocationData = await Portfolio.getAllocation(id);
    const rebalanceNeeds = calculateRebalanceNeeds(allocationData.allocation, portfolio.targetAllocation);

    // Por ahora, solo retornar las recomendaciones
    // En una implementación completa, se crearían las transacciones automáticamente
    portfolio.lastRebalanceDate = new Date();
    await portfolio.save();

    logger.info(`Portfolio ${portfolio.name} rebalanced`);

    return {
      portfolioId: portfolio._id,
      rebalanceDate: portfolio.lastRebalanceDate,
      adjustments: rebalanceNeeds,
      message: 'Rebalance recommendations generated. Please execute transactions manually.',
    };
  }
}

export default new PortfolioService();
