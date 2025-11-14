import api from '../config/api';

/**
 * Contribution Service
 * Handles all API calls related to contributions
 */

// Get all contributions
export const getContributions = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/contributions?${queryString}` : '/contributions';
  return api.get(url);
};

// Get single contribution by ID
export const getContributionById = async (id) => {
  return api.get(`/contributions/${id}`);
};

// Create new contribution
export const createContribution = async (contributionData) => {
  return api.post('/contributions', contributionData);
};

// Update contribution
export const updateContribution = async (id, contributionData) => {
  return api.put(`/contributions/${id}`, contributionData);
};

// Delete contribution
export const deleteContribution = async (id) => {
  return api.delete(`/contributions/${id}`);
};

// Get contributions by date range
export const getContributionsByDateRange = async (startDate, endDate, params = {}) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    ...params,
  }).toString();

  return api.get(`/contributions/date-range?${queryParams}`);
};
