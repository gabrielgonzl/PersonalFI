/**
 * Middleware de manejo de errores centralizado
 */

import logger from '../config/logger.js';
import { ERROR_CODES, HTTP_STATUS } from '../config/constants.js';
import { errorResponse } from '../utils/helpers.js';

/**
 * Middleware para manejar errores de forma centralizada
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error caught by error handler:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Error de validación', HTTP_STATUS.BAD_REQUEST, details)
    );
  }

  // Error de cast (ObjectId inválido, etc.)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        `Formato inválido para ${err.path}: ${err.value}`,
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }

  // Error de duplicado (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json(
      errorResponse(
        ERROR_CODES.CONFLICT,
        `Ya existe un registro con ese ${field}`,
        HTTP_STATUS.CONFLICT
      )
    );
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json(
      errorResponse(err.code || ERROR_CODES.BUSINESS_LOGIC_ERROR, err.message, err.statusCode)
    );
  }

  // Error genérico
  const statusCode = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message;

  res.status(statusCode).json(
    errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, message, statusCode)
  );
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFound = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    errorResponse(
      ERROR_CODES.RESOURCE_NOT_FOUND,
      `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      HTTP_STATUS.NOT_FOUND
    )
  );
};

/**
 * Clase de error personalizado
 */
class AppError extends Error {
  constructor(message, statusCode, code = ERROR_CODES.BUSINESS_LOGIC_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { errorHandler, notFound, AppError };
