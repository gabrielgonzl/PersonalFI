import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and adding auth tokens
api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });

    // Add request timing metadata
    config.metadata = { startTime: Date.now() };

    // You can add auth token here in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unwrapping data and error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime
      ? `${Date.now() - response.config.metadata.startTime}ms`
      : 'N/A';

    console.log('[API Response]', {
      status: response.status,
      duration,
      data: response.data,
    });

    // Backend devuelve: { success: true, data: {...}, count?: number }
    // Devolvemos response.data directamente para que los hooks puedan acceder a .data
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;

      console.error('[API Error]', {
        status: error.response.status,
        message: errorData.message || errorData.error?.message,
        url: error.config?.url,
      });

      // Create structured error object
      const structuredError = {
        message: errorData.error?.message || errorData.message || 'Ha ocurrido un error',
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        statusCode: error.response.status,
        details: errorData.error?.details || [],
      };

      return Promise.reject(structuredError);
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Network Error]', {
        message: 'No se recibió respuesta del servidor',
        url: error.config?.url,
      });

      return Promise.reject({
        message: 'Error de red. Por favor verifica tu conexión y que el backend esté funcionando.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      });
    } else {
      // Something else happened
      console.error('[API Unexpected Error]', error.message);

      return Promise.reject({
        message: error.message || 'Ha ocurrido un error inesperado',
        code: 'UNKNOWN_ERROR',
        statusCode: 0,
      });
    }
  }
);

export default api;
