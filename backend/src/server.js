/**
 * Entry Point - Servidor Growing API
 */

import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import logger from './config/logger.js';

// Cargar variables de entorno
dotenv.config();

// Configuración del puerto
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Iniciar servidor
 */
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();

    // Iniciar servidor Express
    const server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 Growing API Server Started`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📊 API Base: http://localhost:${PORT}/api/v1`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/api/v1/health`);
      logger.info('='.repeat(50));
    });

    // Manejo de graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Cerrar servidor HTTP
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Cerrar conexión a MongoDB
          await disconnectDB();
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('❌ Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
