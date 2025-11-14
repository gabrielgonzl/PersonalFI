import api from '../config/api';

/**
 * Settings Service
 * Handles all API calls related to application settings
 */

// Get current settings
export const getSettings = async () => {
  return api.get('/settings');
};

// Update settings
export const updateSettings = async (settingsData) => {
  return api.put('/settings', settingsData);
};
