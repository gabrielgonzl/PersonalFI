/**
 * Configuración de la aplicación Express
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import { RATE_LIMIT } from './config/constants.js';
import logger from './config/logger.js';

const app = express();

// ============================================
// MIDDLEWARE DE SEGURIDAD
// ============================================

// Helmet - Security headers
app.use(helmet());

// CORS - Configuración
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas peticiones, por favor intenta más tarde',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting a todas las rutas
app.use('/api/', limiter);

// ============================================
// MIDDLEWARE DE PARSEO
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// LOGGING DE REQUESTS
// ============================================

app.use(requestLogger);

// ============================================
// RUTAS
// ============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Growing API v1.0',
    documentation: '/api/v1/health',
    endpoints: {
      health: '/api/v1/health',
      assets: '/api/v1/assets',
      contributions: '/api/v1/contributions',
      portfolios: '/api/v1/portfolios',
      analytics: '/api/v1/analytics',
      settings: '/api/v1/settings',
      prices: '/api/v1/prices',
    },
  });
});

// API Routes
app.use('/api/v1', routes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // En producción, cerrar gracefully
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Cerrar proceso
  process.exit(1);
});

export default app;
