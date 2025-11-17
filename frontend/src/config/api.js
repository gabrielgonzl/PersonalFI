import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
});

// Request ID generator for debugging
let requestId = 0;

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add request ID for debugging
    config.metadata = { requestId: ++requestId, startTime: new Date() };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request #${config.metadata.requestId}]`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    // Add auth token here in the future
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`[API Response #${response.config.metadata.requestId}]`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (import.meta.env.DEV && originalRequest?.metadata) {
      const duration = new Date() - originalRequest.metadata.startTime;
      console.error(`[API Error #${originalRequest.metadata.requestId}]`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        error,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized (future auth implementation)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Implement token refresh logic here in the future
        // const newToken = await refreshToken();
        // if (newToken) {
        //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
        //   return api(originalRequest);
        // }
        localStorage.removeItem('auth_token');
        // Optionally redirect to login
        // window.location.href = '/login';
      }

      // Handle 429 Rate Limit
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5;
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            api(originalRequest).then(resolve).catch(reject);
          }, retryAfter * 1000);
        });
      }

      // Create structured error object
      const structuredError = {
        message: data.error?.message || data.message || 'An error occurred',
        code: data.error?.code || 'UNKNOWN_ERROR',
        statusCode: status,
        details: data.error?.details || [],
        timestamp: new Date().toISOString(),
      };

      return Promise.reject(structuredError);
    }

    // Network error (no response received)
    if (error.request) {
      // Retry logic for network errors
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount++;
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount), 5000);

        if (import.meta.env.DEV) {
          console.log(`[API Retry #${originalRequest._retryCount}] Retrying in ${delay}ms...`);
        }

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            api(originalRequest).then(resolve).catch(reject);
          }, delay);
        });
      }

      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Something else happened
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 0,
      timestamp: new Date().toISOString(),
    });
  }
);

// API Health Check
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/health');
    return { healthy: true, ...response };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

export default api;
