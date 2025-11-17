import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Conectar a MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const options = {
      // Opciones recomendadas para MongoDB 6+
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Event listeners para monitoreo
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Cerrar conexión a MongoDB (para graceful shutdown)
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('📴 MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

export { connectDB, disconnectDB };
