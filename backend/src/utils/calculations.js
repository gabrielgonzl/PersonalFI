/**
 * Utilidades para cálculos financieros avanzados
 */

import { differenceInDays, parseISO } from 'date-fns';

/**
 * Calcular Rentabilidad Simple (Simple Return)
 * @param {number} currentValue - Valor actual
 * @param {number} totalInvested - Total invertido
 * @returns {object} { profitLoss, profitLossPercentage }
 */
export const calculateSimpleReturn = (currentValue, totalInvested) => {
  const profitLoss = currentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return {
    profitLoss: Number(profitLoss.toFixed(2)),
    profitLossPercentage: Number(profitLossPercentage.toFixed(2)),
  };
};

/**
 * Calcular TWR (Time-Weighted Return) - Rendimiento ponderado por tiempo
 * Útil cuando hay múltiples aportaciones en diferentes momentos
 * @param {Array} contributions - Array de contribuciones ordenadas por fecha
 * @param {number} currentPrice - Precio actual del activo
 * @returns {number} TWR en porcentaje
 */
export const calculateTWR = (contributions, currentPrice) => {
  if (!contributions || contributions.length === 0) return 0;

  // Ordenar por fecha ascendente
  const sorted = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calcular simple return si solo hay una contribución
  if (sorted.length === 1 && sorted[0].type === 'buy') {
    const invested = sorted[0].totalAmount;
    const currentValue = sorted[0].quantity * currentPrice;
    return invested > 0 ? Number((((currentValue - invested) / invested) * 100).toFixed(2)) : 0;
  }

  // TWR para múltiples contribuciones
  // Simplificación: usar precio promedio ponderado como proxy
  let totalQuantity = 0;
  let totalInvested = 0;

  sorted.forEach((contrib) => {
    if (contrib.type === 'buy') {
      totalQuantity += contrib.quantity;
      totalInvested += contrib.totalAmount;
    } else if (contrib.type === 'sell') {
      totalQuantity -= contrib.quantity;
      // No restamos del invested
    }
  });

  const currentValue = totalQuantity * currentPrice;
  const twr = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  return Number(twr.toFixed(2));
};

/**
 * Calcular MWR (Money-Weighted Return) o IRR (Internal Rate of Return)
 * Considera el timing y tamaño de las aportaciones
 * Aproximación usando Newton-Raphson
 * @param {Array} contributions - Array de contribuciones
 * @param {number} currentValue - Valor actual total
 * @returns {number} MWR/IRR en porcentaje anualizado
 */
export const calculateMWR = (contributions, currentValue) => {
  if (!contributions || contributions.length === 0) return 0;

  const today = new Date();
  const firstDate = new Date(contributions[0].date);
  const daysTotal = differenceInDays(today, firstDate);

  if (daysTotal === 0) return 0;

  // Función NPV (Net Present Value)
  const npv = (rate) => {
    let value = -currentValue; // Valor actual es salida de efectivo

    contributions.forEach((contrib) => {
      const days = differenceInDays(today, new Date(contrib.date));
      const factor = Math.pow(1 + rate, days / 365);
      // Compras son salidas (-), ventas son entradas (+)
      const cashflow = contrib.type === 'buy' ? -contrib.totalAmount : contrib.totalAmount;
      value += cashflow * factor;
    });

    return value;
  };

  // Derivada de NPV
  const npvDerivative = (rate) => {
    let value = 0;

    contributions.forEach((contrib) => {
      const days = differenceInDays(today, new Date(contrib.date));
      const years = days / 365;
      const factor = Math.pow(1 + rate, years - 1);
      // Compras son salidas (-), ventas son entradas (+)
      const cashflow = contrib.type === 'buy' ? -contrib.totalAmount : contrib.totalAmount;
      value += cashflow * years * factor;
    });

    return value;
  };

  // Newton-Raphson method
  let rate = 0.1; // Tasa inicial 10%
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.0001;

  while (iterations < maxIterations) {
    const npvValue = npv(rate);
    const derivative = npvDerivative(rate);

    if (Math.abs(npvValue) < tolerance) break;
    if (derivative === 0) break;

    rate = rate - npvValue / derivative;
    iterations++;
  }

  const mwrPercentage = rate * 100;
  return Number(mwrPercentage.toFixed(2));
};

/**
 * Calcular DCA (Dollar Cost Average) - Precio promedio ponderado
 * @param {Array} contributions - Array de contribuciones de compra
 * @returns {number} Precio promedio de compra
 */
export const calculateDCA = (contributions) => {
  if (!contributions || contributions.length === 0) return 0;

  const buyContributions = contributions.filter((c) => c.type === 'buy');

  if (buyContributions.length === 0) return 0;

  const totalQuantity = buyContributions.reduce((sum, c) => sum + c.quantity, 0);
  const totalInvested = buyContributions.reduce((sum, c) => sum + c.totalAmount, 0);

  return totalQuantity > 0 ? Number((totalInvested / totalQuantity).toFixed(2)) : 0;
};

/**
 * Calcular ROI anualizado
 * @param {number} profitLossPercentage - Rentabilidad total en porcentaje
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin (por defecto hoy)
 * @returns {number} ROI anualizado en porcentaje
 */
export const calculateAnnualizedROI = (profitLossPercentage, startDate, endDate = new Date()) => {
  const days = differenceInDays(endDate, startDate);

  if (days <= 0) return 0;

  const years = days / 365;

  // Fórmula: (1 + ROI) ^ (1 / years) - 1
  const annualizedROI = (Math.pow(1 + profitLossPercentage / 100, 1 / years) - 1) * 100;

  return Number(annualizedROI.toFixed(2));
};

/**
 * Calcular volatilidad (desviación estándar de los retornos)
 * @param {Array} priceHistory - Array de precios históricos { date, price }
 * @returns {number} Volatilidad en porcentaje
 */
export const calculateVolatility = (priceHistory) => {
  if (!priceHistory || priceHistory.length < 2) return 0;

  // Calcular retornos diarios
  const returns = [];
  for (let i = 1; i < priceHistory.length; i++) {
    const returnValue = (priceHistory[i].price - priceHistory[i - 1].price) / priceHistory[i - 1].price;
    returns.push(returnValue);
  }

  // Calcular promedio de retornos
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calcular desviación estándar
  const squaredDiffs = returns.map((r) => Math.pow(r - avgReturn, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Anualizar (asumiendo 252 días de trading)
  const annualizedVolatility = stdDev * Math.sqrt(252) * 100;

  return Number(annualizedVolatility.toFixed(2));
};

/**
 * Calcular Sharpe Ratio (retorno ajustado por riesgo)
 * @param {number} portfolioReturn - Retorno del portfolio en %
 * @param {number} riskFreeRate - Tasa libre de riesgo en % (ej: 3% bonos del tesoro)
 * @param {number} volatility - Volatilidad del portfolio en %
 * @returns {number} Sharpe Ratio
 */
export const calculateSharpeRatio = (portfolioReturn, riskFreeRate, volatility) => {
  if (volatility === 0) return 0;

  const excessReturn = portfolioReturn - riskFreeRate;
  const sharpe = excessReturn / volatility;

  return Number(sharpe.toFixed(2));
};

/**
 * Calcular distribución porcentual de assets en un portfolio
 * @param {Array} assets - Array de assets con currentValue
 * @param {number} cashBalance - Balance de efectivo
 * @returns {Array} Array con distribución { assetId, value, percentage }
 */
export const calculateAllocation = (assets, cashBalance = 0) => {
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0) + cashBalance;

  if (totalValue === 0) {
    return assets.map((asset) => ({
      assetId: asset._id,
      assetName: asset.name,
      value: 0,
      percentage: 0,
    }));
  }

  const allocation = assets.map((asset) => ({
    assetId: asset._id,
    assetName: asset.name,
    symbol: asset.symbol,
    type: asset.type,
    value: asset.currentValue,
    percentage: Number(((asset.currentValue / totalValue) * 100).toFixed(2)),
  }));

  // Agregar cash si existe
  if (cashBalance > 0) {
    allocation.push({
      type: 'cash',
      assetName: 'Efectivo',
      value: cashBalance,
      percentage: Number(((cashBalance / totalValue) * 100).toFixed(2)),
    });
  }

  return allocation.sort((a, b) => b.value - a.value);
};

/**
 * Calcular diferencia entre distribución actual y objetivo
 * @param {Array} currentAllocation - Distribución actual
 * @param {Array} targetAllocation - Distribución objetivo { assetId, percentage }
 * @returns {Array} Diferencias { assetId, currentPercentage, targetPercentage, difference }
 */
export const calculateRebalanceNeeds = (currentAllocation, targetAllocation) => {
  return targetAllocation.map((target) => {
    const current = currentAllocation.find((a) => a.assetId.toString() === target.assetId.toString());

    const currentPercentage = current ? current.percentage : 0;
    const difference = currentPercentage - target.percentage;

    return {
      assetId: target.assetId,
      assetName: current?.assetName || 'Unknown',
      targetPercentage: target.percentage,
      currentPercentage,
      difference: Number(difference.toFixed(2)),
      action: difference > 0 ? 'sell' : 'buy',
    };
  });
};

/**
 * Calcular evolución temporal del portfolio
 * @param {Array} contributions - Todas las contribuciones ordenadas por fecha
 * @param {number} currentPrice - Precio actual
 * @returns {Array} Timeline con { date, invested, value, profitLoss }
 */
export const calculateTimeline = (contributions, currentPrice) => {
  if (!contributions || contributions.length === 0) return [];

  const timeline = [];
  let cumulativeInvested = 0;
  let cumulativeQuantity = 0;

  // Ordenar por fecha
  const sorted = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date));

  sorted.forEach((contrib) => {
    if (contrib.type === 'buy') {
      cumulativeInvested += contrib.totalAmount;
      cumulativeQuantity += contrib.quantity;
    } else if (contrib.type === 'sell') {
      // El invested no cambia en ventas, solo la cantidad
      // cumulativeInvested representa el dinero total que se ha invertido, no el valor actual
      cumulativeQuantity -= contrib.quantity;
    }

    const value = cumulativeQuantity * contrib.pricePerUnit;

    timeline.push({
      date: contrib.date,
      invested: Number(cumulativeInvested.toFixed(2)),
      value: Number(value.toFixed(2)),
      profitLoss: Number((value - cumulativeInvested).toFixed(2)),
    });
  });

  // Agregar punto actual
  const currentValue = cumulativeQuantity * currentPrice;
  timeline.push({
    date: new Date(),
    invested: Number(cumulativeInvested.toFixed(2)),
    value: Number(currentValue.toFixed(2)),
    profitLoss: Number((currentValue - cumulativeInvested).toFixed(2)),
  });

  return timeline;
};

/**
 * Calcular métricas de performance completas
 * @param {Array} contributions - Contribuciones
 * @param {number} currentValue - Valor actual
 * @param {number} currentPrice - Precio actual
 * @returns {object} Métricas completas
 */
export const calculatePerformanceMetrics = (contributions, currentValue, currentPrice) => {
  if (!contributions || contributions.length === 0) {
    return {
      simpleReturn: 0,
      twr: 0,
      mwr: 0,
      dca: 0,
      annualizedROI: 0,
    };
  }

  const totalInvested = contributions
    .filter((c) => c.type === 'buy')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const { profitLoss, profitLossPercentage } = calculateSimpleReturn(currentValue, totalInvested);

  const firstDate = new Date(Math.min(...contributions.map((c) => new Date(c.date))));

  return {
    simpleReturn: profitLossPercentage,
    profitLoss,
    twr: calculateTWR(contributions, currentPrice),
    mwr: calculateMWR(contributions, currentValue),
    dca: calculateDCA(contributions),
    annualizedROI: calculateAnnualizedROI(profitLossPercentage, firstDate),
    totalInvested,
    currentValue,
  };
};

export default {
  calculateSimpleReturn,
  calculateTWR,
  calculateMWR,
  calculateDCA,
  calculateAnnualizedROI,
  calculateVolatility,
  calculateSharpeRatio,
  calculateAllocation,
  calculateRebalanceNeeds,
  calculateTimeline,
  calculatePerformanceMetrics,
};
