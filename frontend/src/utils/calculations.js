/**
 * Calculate average price
 * @param {number} totalInvested - Total amount invested
 * @param {number} quantity - Total quantity
 * @returns {number} Average price per unit
 */
export const calculateAveragePrice = (totalInvested, quantity) => {
  if (!quantity || quantity === 0) return 0;
  return totalInvested / quantity;
};

/**
 * Calculate current value
 * @param {number} quantity - Quantity of asset
 * @param {number} currentPrice - Current price per unit
 * @returns {number} Current value
 */
export const calculateCurrentValue = (quantity, currentPrice) => {
  return quantity * currentPrice;
};

/**
 * Calculate profit/loss
 * @param {number} currentValue - Current value
 * @param {number} totalInvested - Total amount invested
 * @returns {number} Profit/loss amount
 */
export const calculateProfitLoss = (currentValue, totalInvested) => {
  return currentValue - totalInvested;
};

/**
 * Calculate profit/loss percentage
 * @param {number} profitLoss - Profit/loss amount
 * @param {number} totalInvested - Total amount invested
 * @returns {number} Profit/loss percentage
 */
export const calculateProfitLossPercentage = (profitLoss, totalInvested) => {
  if (!totalInvested || totalInvested === 0) return 0;
  return (profitLoss / totalInvested) * 100;
};

/**
 * Calculate ROI (Return on Investment)
 * @param {number} currentValue - Current value
 * @param {number} totalInvested - Total amount invested
 * @returns {number} ROI percentage
 */
export const calculateROI = (currentValue, totalInvested) => {
  if (!totalInvested || totalInvested === 0) return 0;
  return ((currentValue - totalInvested) / totalInvested) * 100;
};

/**
 * Calculate portfolio total value
 * @param {number} cashBalance - Cash balance in portfolio
 * @param {Array} assets - Array of assets
 * @returns {number} Total portfolio value
 */
export const calculatePortfolioTotalValue = (cashBalance = 0, assets = []) => {
  const assetsValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  return cashBalance + assetsValue;
};

/**
 * Calculate asset allocation percentage
 * @param {number} assetValue - Value of the asset
 * @param {number} totalValue - Total portfolio value
 * @returns {number} Allocation percentage
 */
export const calculateAllocationPercentage = (assetValue, totalValue) => {
  if (!totalValue || totalValue === 0) return 0;
  return (assetValue / totalValue) * 100;
};

/**
 * Calculate weighted average
 * @param {Array} items - Array of items with value and weight
 * @returns {number} Weighted average
 */
export const calculateWeightedAverage = (items) => {
  if (!items || items.length === 0) return 0;

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = items.reduce((sum, item) => sum + (item.value * item.weight), 0);
  return weightedSum / totalWeight;
};

/**
 * Calculate total from contributions
 * @param {Array} contributions - Array of contribution objects
 * @param {string} type - Type of contributions to sum ('buy', 'sell', etc.)
 * @returns {number} Total amount
 */
export const calculateContributionTotal = (contributions, type = null) => {
  if (!contributions || contributions.length === 0) return 0;

  const filtered = type
    ? contributions.filter(c => c.type === type)
    : contributions;

  return filtered.reduce((sum, contribution) => sum + (contribution.totalAmount || 0), 0);
};

/**
 * Calculate quantity from contributions
 * @param {Array} contributions - Array of contribution objects
 * @returns {number} Total quantity
 */
export const calculateQuantityFromContributions = (contributions) => {
  if (!contributions || contributions.length === 0) return 0;

  return contributions.reduce((total, contribution) => {
    if (contribution.type === 'buy' || contribution.type === 'transfer_in') {
      return total + (contribution.quantity || 0);
    } else if (contribution.type === 'sell' || contribution.type === 'transfer_out') {
      return total - (contribution.quantity || 0);
    }
    return total;
  }, 0);
};

/**
 * Calculate diversification score (0-100)
 * Higher score = better diversification
 * @param {Array} allocations - Array of allocation percentages
 * @returns {number} Diversification score
 */
export const calculateDiversificationScore = (allocations) => {
  if (!allocations || allocations.length === 0) return 0;
  if (allocations.length === 1) return 0;

  // Calculate Herfindahl-Hirschman Index (HHI)
  const hhi = allocations.reduce((sum, allocation) => {
    const percentage = allocation / 100;
    return sum + (percentage * percentage);
  }, 0);

  // Convert HHI to diversification score (0-100)
  // HHI ranges from 1/n (perfectly diversified) to 1 (all in one asset)
  const n = allocations.length;
  const minHHI = 1 / n;
  const maxHHI = 1;

  const score = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate rebalancing suggestions
 * @param {Array} assets - Current assets with their values
 * @param {Array} targetAllocation - Target allocation percentages
 * @param {number} totalValue - Total portfolio value
 * @returns {Array} Array of rebalancing suggestions
 */
export const calculateRebalancingSuggestions = (assets, targetAllocation, totalValue) => {
  if (!assets || !targetAllocation || !totalValue) return [];

  return assets.map(asset => {
    const target = targetAllocation.find(t => t.assetId === asset._id);
    if (!target) return null;

    const currentAllocation = (asset.currentValue / totalValue) * 100;
    const targetPercentage = target.percentage;
    const difference = targetPercentage - currentAllocation;
    const amountDifference = (difference / 100) * totalValue;

    return {
      assetId: asset._id,
      assetName: asset.name,
      currentValue: asset.currentValue,
      currentAllocation,
      targetAllocation: targetPercentage,
      difference,
      amountDifference,
      action: amountDifference > 0 ? 'buy' : 'sell',
    };
  }).filter(Boolean);
};

/**
 * Calculate compound annual growth rate (CAGR)
 * @param {number} beginningValue - Initial value
 * @param {number} endingValue - Final value
 * @param {number} years - Number of years
 * @returns {number} CAGR percentage
 */
export const calculateCAGR = (beginningValue, endingValue, years) => {
  if (!beginningValue || !years || years === 0) return 0;
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
};
