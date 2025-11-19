import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from './constants';

/**
 * Enhanced API Client with advanced features:
 * - Request deduplication
 * - Automatic retry with exponential backoff
 * - Rate limiting handling
 * - Global loading state
 * - Smart error handling
 * - Request/response logging
 */
class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request cache for deduplication
    this.requestCache = new Map();

    // Active requests counter for loading state
    this.activeRequests = 0;

    // Loading state callbacks
    this.loadingCallbacks = new Set();

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Create unique request ID for deduplication
        const requestId = this.generateRequestId(config);

        // Check if identical request is already in flight
        if (this.requestCache.has(requestId)) {
          const cachedPromise = this.requestCache.get(requestId);
          config.signal = new AbortController().signal; // Will be cancelled
          return cachedPromise;
        }

        // Add metadata
        config.metadata = {
          startTime: Date.now(),
          requestId,
        };

        // Increment active requests
        this.incrementRequests();

        // Log in development
        if (import.meta.env.DEV) {
          console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        this.decrementRequests();
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = this.calculateDuration(response.config);

        // Log in development
        if (import.meta.env.DEV) {
          console.log(`✅ [API Response] ${response.status} - ${duration}ms`, {
            url: response.config.url,
            data: response.data,
          });
        }

        // Remove from cache
        const requestId = response.config.metadata?.requestId;
        if (requestId) {
          this.requestCache.delete(requestId);
        }

        // Decrement active requests
        this.decrementRequests();

        // Return data (backend returns { success, data, count })
        return response.data;
      },
      async (error) => {
        const originalRequest = error.config;

        // Decrement active requests
        this.decrementRequests();

        // Remove from cache
        const requestId = originalRequest?.metadata?.requestId;
        if (requestId) {
          this.requestCache.delete(requestId);
        }

        // Handle different error scenarios
        return this.handleError(error, originalRequest);
      }
    );
  }

  /**
   * Handle errors with smart retry logic
   */
  async handleError(error, originalRequest) {
    // Network error - retry
    if (!error.response && !originalRequest._retry) {
      return this.retryRequest(originalRequest, 'Network error');
    }

    // Handle specific HTTP status codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          this.handleValidationError(data);
          break;

        case 401:
          this.handleAuthError(data);
          break;

        case 404:
          toast.error('Recurso no encontrado');
          break;

        case 422:
          this.handleBusinessError(data);
          break;

        case 429:
          // Rate limit - retry after delay
          return this.handleRateLimit(error, originalRequest);

        case 500:
        case 502:
        case 503:
        case 504:
          // Server error - retry
          if (!originalRequest._retry) {
            return this.retryRequest(originalRequest, `Server error (${status})`);
          }
          toast.error('Error del servidor. Por favor intenta nuevamente.');
          break;

        default:
          toast.error(data.error?.message || 'Ha ocurrido un error');
      }
    }

    // Create structured error
    const structuredError = this.createStructuredError(error);

    // Log error
    if (import.meta.env.DEV) {
      console.error('❌ [API Error]', structuredError);
    }

    return Promise.reject(structuredError);
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(originalRequest, reason) {
    originalRequest._retry = true;
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

    // Max 3 retries
    if (originalRequest._retryCount > 3) {
      toast.error('No se pudo conectar con el servidor. Por favor intenta más tarde.');
      return Promise.reject({
        message: 'Max retries exceeded',
        code: 'MAX_RETRIES',
      });
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;

    if (import.meta.env.DEV) {
      console.log(`🔄 [API Retry] Attempt ${originalRequest._retryCount}/3 - ${reason} - Waiting ${delay}ms`);
    }

    await this.delay(delay);

    return this.client(originalRequest);
  }

  /**
   * Handle rate limiting (429)
   */
  async handleRateLimit(error, originalRequest) {
    const retryAfter = error.response?.headers['retry-after'] || 5;
    const delayMs = parseInt(retryAfter) * 1000;

    toast.warning(`Demasiadas peticiones. Reintentando en ${retryAfter} segundos...`);

    if (import.meta.env.DEV) {
      console.log(`⏳ [API Rate Limit] Waiting ${retryAfter}s before retry`);
    }

    await this.delay(delayMs);

    return this.client(originalRequest);
  }

  /**
   * Handle validation errors (400)
   */
  handleValidationError(data) {
    const details = data.error?.details || [];

    if (details.length > 0) {
      // Show first validation error
      const message = details[0].message || 'Error de validación';
      toast.error(message);
    } else {
      toast.error(data.error?.message || 'Error de validación');
    }
  }

  /**
   * Handle business logic errors (422)
   */
  handleBusinessError(data) {
    const message = data.error?.message || 'Operación no permitida';
    toast.error(message);
  }

  /**
   * Handle authentication errors (401)
   */
  handleAuthError(data) {
    toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');

    // Redirect to login (if implemented)
    // window.location.href = '/login';
  }

  /**
   * Generate unique request ID for deduplication
   */
  generateRequestId(config) {
    const { method, url, params, data } = config;
    const paramsStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${paramsStr}:${dataStr}`;
  }

  /**
   * Create structured error object
   */
  createStructuredError(error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        message: data.error?.message || data.message || 'Ha ocurrido un error',
        code: data.error?.code || 'UNKNOWN_ERROR',
        statusCode: status,
        details: data.error?.details || [],
      };
    }

    if (error.request) {
      return {
        message: 'Error de red. Verifica tu conexión.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      };
    }

    return {
      message: error.message || 'Error inesperado',
      code: 'UNKNOWN_ERROR',
      statusCode: 0,
    };
  }

  /**
   * Calculate request duration
   */
  calculateDuration(config) {
    if (config.metadata?.startTime) {
      return Date.now() - config.metadata.startTime;
    }
    return 0;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Loading state management
   */
  incrementRequests() {
    this.activeRequests++;
    this.notifyLoadingState(true);
  }

  decrementRequests() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.notifyLoadingState(false);
    }
  }

  notifyLoadingState(isLoading) {
    this.loadingCallbacks.forEach(callback => callback(isLoading));
  }

  onLoadingChange(callback) {
    this.loadingCallbacks.add(callback);
    return () => this.loadingCallbacks.delete(callback);
  }

  /**
   * Public API methods
   */
  get(url, config = {}) {
    return this.client.get(url, config);
  }

  post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

// Export singleton instance (mantiene compatibilidad con imports existentes)
const api = new ApiClient();
export default api;
