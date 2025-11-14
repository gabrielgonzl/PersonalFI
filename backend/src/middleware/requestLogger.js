/**
 * Middleware para logging de requests HTTP
 */

import logger from '../config/logger.js';

/**
 * Middleware para loggear requests entrantes
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Loggear cuando la respuesta finaliza
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Loggear según el status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Warning', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
};

export default requestLogger;
