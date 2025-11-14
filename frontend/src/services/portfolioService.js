import api from '../config/api';

/**
 * Portfolio Service
 * Handles all API calls related to portfolios
 */

// Get all portfolios
export const getPortfolios = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/portfolios?${queryString}` : '/portfolios';
  return api.get(url);
};

// Get single portfolio by ID
export const getPortfolioById = async (id) => {
  return api.get(`/portfolios/${id}`);
};

// Create new portfolio
export const createPortfolio = async (portfolioData) => {
  return api.post('/portfolios', portfolioData);
};

// Update portfolio
export const updatePortfolio = async (id, portfolioData) => {
  return api.put(`/portfolios/${id}`, portfolioData);
};

// Delete portfolio
export const deletePortfolio = async (id) => {
  return api.delete(`/portfolios/${id}`);
};

// Add cash to portfolio
export const addCashToPortfolio = async (id, cashData) => {
  return api.post(`/portfolios/${id}/add-cash`, cashData);
};

// Distribute cash among assets
export const distributeCash = async (id, distributionData) => {
  return api.post(`/portfolios/${id}/distribute-cash`, distributionData);
};

// Get portfolio allocation
export const getPortfolioAllocation = async (id) => {
  return api.get(`/portfolios/${id}/allocation`);
};

// Rebalance portfolio
export const rebalancePortfolio = async (id, rebalanceData) => {
  return api.post(`/portfolios/${id}/rebalance`, rebalanceData);
};
