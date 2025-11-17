import axios from 'axios';
import { API_BASE_URL } from './constants';
import {
  mockAssets,
  mockPortfolios,
  mockAnalyticsOverview,
  mockPerformanceData,
  mockDistributionData,
  mockTopPerformers,
  mockTimelineData,
  mockContributions,
  mockSettings,
} from '../utils/mockData';

// Modo de desarrollo - usar datos mock solo si se especifica explícitamente en variables de entorno
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API responses
const mockResponses = {
  'GET /assets': () => ({ success: true, count: mockAssets.length, data: mockAssets }),
  'GET /assets/:id': (id) => {
    const asset = mockAssets.find(a => a._id === id);
    return asset ? { success: true, data: asset } : null;
  },
  'GET /portfolios': () => ({ success: true, count: mockPortfolios.length, data: mockPortfolios }),
  'GET /portfolios/:id': (id) => {
    const portfolio = mockPortfolios.find(p => p._id === id);
    return portfolio ? { success: true, data: portfolio } : null;
  },
  'GET /analytics/overview': () => ({ success: true, data: mockAnalyticsOverview }),
  'GET /analytics/performance': () => ({ success: true, data: mockPerformanceData }),
  'GET /analytics/distribution': () => ({ success: true, data: mockDistributionData }),
  'GET /analytics/top-performers': () => ({ success: true, data: mockTopPerformers }),
  'GET /analytics/timeline': () => ({ success: true, data: mockTimelineData }),
  'GET /contributions': () => ({ success: true, count: mockContributions.length, data: mockContributions }),
  'GET /settings': () => ({ success: true, data: mockSettings }),
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });

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

// Response interceptor with mock data support
api.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata?.endTime
      ? `${response.config.metadata.endTime - response.config.metadata.startTime}ms`
      : 'N/A';

    console.log('[API Response]', {
      status: response.status,
      duration,
      data: response.data,
    });

    return response.data;
  },
  async (error) => {
    // Si usamos mock data y hay un error de red, devolver datos mock
    if (USE_MOCK_DATA && (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED')) {
      const { method, url } = error.config;
      const mockKey = `${method.toUpperCase()} ${url.split('?')[0]}`;

      console.warn('[API Mock]', `Using mock data for ${mockKey}`);

      // Buscar respuesta mock
      for (const [key, mockFn] of Object.entries(mockResponses)) {
        if (key.includes(':id')) {
          const baseKey = key.split('/:id')[0];
          if (mockKey.startsWith(baseKey.replace('GET ', 'GET '))) {
            const id = url.split('/').pop().split('?')[0];
            const mockData = mockFn(id);
            if (mockData) {
              return Promise.resolve(mockData);
            }
          }
        } else if (mockKey.includes(key.replace('GET ', ''))) {
          return Promise.resolve(mockFn());
        }
      }

      // Si no hay mock específico, devolver array vacío
      return Promise.resolve({ success: true, data: [], count: 0 });
    }

    // Handle errors
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data;

      // Create structured error object
      const structuredError = {
        message: errorData.error?.message || errorData.message || 'Ha ocurrido un error',
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        statusCode: error.response.status,
        details: errorData.error?.details || [],
      };

      return Promise.reject(structuredError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Error de red. Por favor verifica tu conexión.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Ha ocurrido un error inesperado',
        code: 'UNKNOWN_ERROR',
        statusCode: 0,
      });
    }
  }
);

// Add request timing
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  if (response.config.metadata) {
    response.config.metadata.endTime = Date.now();
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api;
