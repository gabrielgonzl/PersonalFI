import api from '../config/api';

/**
 * Asset Service
 * Handles all API calls related to assets
 */

// Get all assets
export const getAssets = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/assets?${queryString}` : '/assets';
  return api.get(url);
};

// Get single asset by ID
export const getAssetById = async (id) => {
  return api.get(`/assets/${id}`);
};

// Create new asset
export const createAsset = async (assetData) => {
  return api.post('/assets', assetData);
};

// Update asset
export const updateAsset = async (id, assetData) => {
  return api.put(`/assets/${id}`, assetData);
};

// Delete asset
export const deleteAsset = async (id) => {
  return api.delete(`/assets/${id}`);
};

// Get asset contributions
export const getAssetContributions = async (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `/assets/${id}/contributions?${queryString}`
    : `/assets/${id}/contributions`;
  return api.get(url);
};

// Get asset performance
export const getAssetPerformance = async (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `/assets/${id}/performance?${queryString}`
    : `/assets/${id}/performance`;
  return api.get(url);
};

// Update asset price
export const updateAssetPrice = async (id, priceData) => {
  return api.post(`/assets/${id}/update-price`, priceData);
};
