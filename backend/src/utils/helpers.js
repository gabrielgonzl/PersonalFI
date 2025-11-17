/**
 * Funciones auxiliares generales
 */

/**
 * Formatear respuesta exitosa de API
 */
export const successResponse = (data, message = null) => {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return response;
};

/**
 * Formatear respuesta de error de API
 */
export const errorResponse = (code, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
      statusCode,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * Crear objeto de paginación
 */
export const createPaginationMeta = (page, limit, total) => {
  const pages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

/**
 * Esperar un tiempo determinado (para rate limiting, etc.)
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Formatear número a 2 decimales
 */
export const roundTo2Decimals = (num) => {
  return Math.round(num * 100) / 100;
};

/**
 * Parsear query de fecha
 */
export const parseDateQuery = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export default {
  successResponse,
  errorResponse,
  createPaginationMeta,
  sleep,
  roundTo2Decimals,
  parseDateQuery,
};
