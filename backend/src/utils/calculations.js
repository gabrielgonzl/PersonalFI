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
 * CORREGIDO: Ahora incluye fees en el cálculo
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
    const invested = sorted[0].totalAmount + (sorted[0].fees || 0); // INCLUIR FEES
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
      totalInvested += contrib.totalAmount + (contrib.fees || 0); // INCLUIR FEES
    } else if (contrib.type === 'sell') {
      totalQuantity -= contrib.quantity;
      totalInvested -= contrib.fees || 0; // Restar fees de venta del capital invertido
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
 * CORREGIDO: Ahora incluye fees en el cálculo
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
      // INCLUIR FEES: Los fees se suman al costo de compra o se restan del ingreso de venta
      const cashflow = contrib.type === 'buy'
        ? -(contrib.totalAmount + (contrib.fees || 0))  // Compra + fees
        : (contrib.totalAmount - (contrib.fees || 0));   // Venta - fees
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
      // INCLUIR FEES
      const cashflow = contrib.type === 'buy'
        ? -(contrib.totalAmount + (contrib.fees || 0))
        : (contrib.totalAmount - (contrib.fees || 0));
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

/**
 * Calcular Maximum Drawdown (máxima caída desde peak histórico)
 * Métrica crítica de riesgo que muestra la peor pérdida desde un máximo
 * @param {Array} valueHistory - Array de { date, value }
 * @returns {object} { maxDrawdown, maxDrawdownPercentage, peakDate, troughDate }
 */
export const calculateMaxDrawdown = (valueHistory) => {
  if (!valueHistory || valueHistory.length < 2) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercentage: 0,
      peakValue: 0,
      troughValue: 0,
      peakDate: null,
      troughDate: null,
    };
  }

  let maxDrawdown = 0;
  let maxDrawdownPercentage = 0;
  let peak = valueHistory[0].value;
  let peakDate = valueHistory[0].date;
  let troughDate = null;
  let peakValue = peak;
  let troughValue = peak;

  for (let i = 1; i < valueHistory.length; i++) {
    const currentValue = valueHistory[i].value;

    // Actualizar peak si encontramos nuevo máximo
    if (currentValue > peak) {
      peak = currentValue;
      peakDate = valueHistory[i].date;
    }

    // Calcular drawdown desde el peak
    const drawdown = peak - currentValue;
    const drawdownPercentage = peak > 0 ? (drawdown / peak) * 100 : 0;

    // Actualizar máximo drawdown
    if (drawdownPercentage > maxDrawdownPercentage) {
      maxDrawdown = drawdown;
      maxDrawdownPercentage = drawdownPercentage;
      peakValue = peak;
      troughValue = currentValue;
      troughDate = valueHistory[i].date;
    }
  }

  return {
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDrawdownPercentage: Number(maxDrawdownPercentage.toFixed(2)),
    peakValue: Number(peakValue.toFixed(2)),
    troughValue: Number(troughValue.toFixed(2)),
    peakDate,
    troughDate,
  };
};

/**
 * Calcular Value at Risk (VaR) - Pérdida máxima esperada con cierto nivel de confianza
 * @param {Array} returns - Array de retornos (decimales)
 * @param {number} confidenceLevel - Nivel de confianza (0.95 = 95%, 0.99 = 99%)
 * @returns {object} { var, percentile }
 */
export const calculateVaR = (returns, confidenceLevel = 0.95) => {
  if (!returns || returns.length === 0) {
    return { var: 0, percentile: 0 };
  }

  // Ordenar retornos de menor a mayor
  const sortedReturns = [...returns].sort((a, b) => a - b);

  // Encontrar el percentil correspondiente
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  const percentile = sortedReturns[index];

  return {
    var: Number(Math.abs(percentile).toFixed(4)),
    percentile: Number((percentile * 100).toFixed(2)),
    confidenceLevel,
  };
};

/**
 * Calcular Sortino Ratio (similar a Sharpe pero solo considera downside volatility)
 * @param {number} portfolioReturn - Retorno del portfolio en %
 * @param {number} riskFreeRate - Tasa libre de riesgo en %
 * @param {Array} returns - Array de retornos para calcular downside deviation
 * @returns {number} Sortino Ratio
 */
export const calculateSortinoRatio = (portfolioReturn, riskFreeRate, returns) => {
  if (!returns || returns.length === 0) return 0;

  // Calcular solo la desviación de retornos negativos (downside deviation)
  const negativeReturns = returns.filter((r) => r < 0);

  if (negativeReturns.length === 0) return Infinity; // No hay pérdidas

  const avgNegativeReturn = negativeReturns.reduce((sum, r) => sum + r, 0) / negativeReturns.length;
  const squaredDiffs = negativeReturns.map((r) => Math.pow(r - avgNegativeReturn, 2));
  const downsideVariance = squaredDiffs.reduce((sum, d) => sum + d, 0) / negativeReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);

  // Anualizar
  const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(252) * 100;

  if (annualizedDownsideDeviation === 0) return 0;

  const excessReturn = portfolioReturn - riskFreeRate;
  const sortino = excessReturn / annualizedDownsideDeviation;

  return Number(sortino.toFixed(2));
};

/**
 * Calcular Calmar Ratio (retorno anualizado / maximum drawdown)
 * @param {number} annualizedReturn - Retorno anualizado en %
 * @param {number} maxDrawdownPercentage - Maximum drawdown en %
 * @returns {number} Calmar Ratio
 */
export const calculateCalmarRatio = (annualizedReturn, maxDrawdownPercentage) => {
  if (maxDrawdownPercentage === 0) return 0;
  return Number((annualizedReturn / maxDrawdownPercentage).toFixed(2));
};

/**
 * Calcular Beta (sensibilidad del portfolio vs benchmark)
 * @param {Array} portfolioReturns - Retornos del portfolio
 * @param {Array} benchmarkReturns - Retornos del benchmark
 * @returns {number} Beta
 */
export const calculateBeta = (portfolioReturns, benchmarkReturns) => {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length === 0 || benchmarkReturns.length === 0) {
    return 1.0; // Beta neutral por defecto
  }

  const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
  const portfolioSlice = portfolioReturns.slice(0, minLength);
  const benchmarkSlice = benchmarkReturns.slice(0, minLength);

  // Calcular promedios
  const avgPortfolio = portfolioSlice.reduce((sum, r) => sum + r, 0) / minLength;
  const avgBenchmark = benchmarkSlice.reduce((sum, r) => sum + r, 0) / minLength;

  // Calcular covarianza
  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < minLength; i++) {
    const portfolioDiff = portfolioSlice[i] - avgPortfolio;
    const benchmarkDiff = benchmarkSlice[i] - avgBenchmark;

    covariance += portfolioDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }

  covariance /= minLength;
  benchmarkVariance /= minLength;

  if (benchmarkVariance === 0) return 1.0;

  const beta = covariance / benchmarkVariance;
  return Number(beta.toFixed(2));
};

/**
 * Calcular Alpha (retorno en exceso ajustado por beta)
 * @param {number} portfolioReturn - Retorno del portfolio en %
 * @param {number} riskFreeRate - Tasa libre de riesgo en %
 * @param {number} benchmarkReturn - Retorno del benchmark en %
 * @param {number} beta - Beta del portfolio
 * @returns {number} Alpha en %
 */
export const calculateAlpha = (portfolioReturn, riskFreeRate, benchmarkReturn, beta) => {
  // Fórmula CAPM: Alpha = Portfolio Return - [Risk Free Rate + Beta × (Benchmark Return - Risk Free Rate)]
  const expectedReturn = riskFreeRate + beta * (benchmarkReturn - riskFreeRate);
  const alpha = portfolioReturn - expectedReturn;

  return Number(alpha.toFixed(2));
};

/**
 * Calcular índice de Herfindahl-Hirschman (HHI) para diversificación
 * @param {Array} assets - Array de assets con currentValue
 * @returns {object} { hhi, effectiveAssets, diversificationScore }
 */
export const calculateHHI = (assets) => {
  if (!assets || assets.length === 0) {
    return { hhi: 1, effectiveAssets: 0, diversificationScore: 0 };
  }

  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  if (totalValue === 0) {
    return { hhi: 1, effectiveAssets: 0, diversificationScore: 0 };
  }

  // Calcular HHI = Σ(weight_i)²
  const hhi = assets.reduce((sum, asset) => {
    const weight = asset.currentValue / totalValue;
    return sum + weight * weight;
  }, 0);

  // Número efectivo de activos (inverso del HHI)
  const effectiveAssets = 1 / hhi;

  // Score de diversificación (0-100, donde 100 es perfectamente diversificado)
  // Asumiendo que un portfolio ideal tiene al menos 10 activos equivalentes
  const idealAssets = 10;
  const diversificationScore = Math.min(100, (effectiveAssets / idealAssets) * 100);

  return {
    hhi: Number(hhi.toFixed(4)),
    effectiveAssets: Number(effectiveAssets.toFixed(2)),
    diversificationScore: Number(diversificationScore.toFixed(1)),
  };
};

/**
 * Calcular matriz de correlación entre activos
 * @param {Object} assetReturns - Objeto con { assetId: [returns] }
 * @returns {Array} Matriz de correlación
 */
export const calculateCorrelationMatrix = (assetReturns) => {
  const assetIds = Object.keys(assetReturns);

  if (assetIds.length < 2) {
    return [];
  }

  const matrix = [];

  for (let i = 0; i < assetIds.length; i++) {
    const row = [];
    for (let j = 0; j < assetIds.length; j++) {
      if (i === j) {
        row.push({ correlation: 1.0, assetId1: assetIds[i], assetId2: assetIds[j] });
      } else {
        const correlation = calculateCorrelation(assetReturns[assetIds[i]], assetReturns[assetIds[j]]);
        row.push({
          correlation,
          assetId1: assetIds[i],
          assetId2: assetIds[j],
        });
      }
    }
    matrix.push(row);
  }

  return matrix;
};

/**
 * Calcular correlación entre dos series de retornos
 * @param {Array} returns1 - Retornos del activo 1
 * @param {Array} returns2 - Retornos del activo 2
 * @returns {number} Coeficiente de correlación (-1 a 1)
 */
export const calculateCorrelation = (returns1, returns2) => {
  if (!returns1 || !returns2 || returns1.length === 0 || returns2.length === 0) {
    return 0;
  }

  const minLength = Math.min(returns1.length, returns2.length);
  const r1 = returns1.slice(0, minLength);
  const r2 = returns2.slice(0, minLength);

  const avg1 = r1.reduce((sum, r) => sum + r, 0) / minLength;
  const avg2 = r2.reduce((sum, r) => sum + r, 0) / minLength;

  let numerator = 0;
  let sum1Squared = 0;
  let sum2Squared = 0;

  for (let i = 0; i < minLength; i++) {
    const diff1 = r1[i] - avg1;
    const diff2 = r2[i] - avg2;

    numerator += diff1 * diff2;
    sum1Squared += diff1 * diff1;
    sum2Squared += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1Squared * sum2Squared);

  if (denominator === 0) return 0;

  return Number((numerator / denominator).toFixed(4));
};

/**
 * Calcular métricas de riesgo completas
 * @param {Array} valueHistory - Historial de valores { date, value }
 * @param {Array} returns - Array de retornos
 * @param {number} riskFreeRate - Tasa libre de riesgo (default 3%)
 * @returns {object} Todas las métricas de riesgo
 */
export const calculateRiskMetrics = (valueHistory, returns, riskFreeRate = 3) => {
  if (!returns || returns.length === 0) {
    return {
      volatility: 0,
      maxDrawdown: calculateMaxDrawdown(valueHistory || []),
      var95: 0,
      var99: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
    };
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = avgReturn * 252 * 100; // Asumiendo 252 días de trading

  const volatility = calculateVolatility(valueHistory || []);
  const maxDrawdownData = calculateMaxDrawdown(valueHistory || []);
  const var95 = calculateVaR(returns, 0.95);
  const var99 = calculateVaR(returns, 0.99);
  const sharpeRatio = calculateSharpeRatio(annualizedReturn, riskFreeRate, volatility);
  const sortinoRatio = calculateSortinoRatio(annualizedReturn, riskFreeRate, returns);
  const calmarRatio = calculateCalmarRatio(annualizedReturn, maxDrawdownData.maxDrawdownPercentage);

  return {
    volatility,
    annualizedReturn: Number(annualizedReturn.toFixed(2)),
    maxDrawdown: maxDrawdownData,
    var95,
    var99,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
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
  calculateMaxDrawdown,
  calculateVaR,
  calculateSortinoRatio,
  calculateCalmarRatio,
  calculateBeta,
  calculateAlpha,
  calculateHHI,
  calculateCorrelationMatrix,
  calculateCorrelation,
  calculateRiskMetrics,
};
