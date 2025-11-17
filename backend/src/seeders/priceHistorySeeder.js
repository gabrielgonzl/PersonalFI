/**
 * Seeder para poblar precios históricos y benchmarks
 * Ejecutar: node src/seeders/priceHistorySeeder.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import priceHistoryService from '../services/priceHistoryService.js';
import benchmarkService from '../services/benchmarkService.js';
import { Asset } from '../models/index.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personalfi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const seedPriceHistory = async () => {
  try {
    console.log('\n📊 Iniciando seed de precios históricos...\n');

    // 1. Inicializar benchmarks predeterminados
    console.log('1️⃣  Inicializando benchmarks predeterminados...');
    const benchmarkResults = await benchmarkService.initializeDefaultBenchmarks();
    console.log('✓ Benchmarks inicializados:');
    benchmarkResults.forEach((result) => {
      if (result.success) {
        console.log(`   ✓ ${result.benchmark}`);
      } else {
        console.log(`   ✗ ${result.symbol}: ${result.error}`);
      }
    });

    // 2. Generar precios históricos sintéticos para benchmarks
    console.log('\n2️⃣  Generando precios históricos para benchmarks...');
    const { Benchmark } = await import('../models/index.js');
    const benchmarks = await Benchmark.find({ isActive: true });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 3); // 3 años de historia

    for (const benchmark of benchmarks) {
      try {
        console.log(`   Generando precios para ${benchmark.name} (${benchmark.symbol})...`);
        await benchmarkService.generateSyntheticBenchmarkPrices(benchmark._id, startDate, endDate);
        console.log(`   ✓ ${benchmark.symbol}: Precios generados`);
      } catch (error) {
        console.error(`   ✗ Error en ${benchmark.symbol}:`, error.message);
      }
    }

    // 3. Generar precios históricos para todos los assets
    console.log('\n3️⃣  Generando precios históricos para assets...');
    const assetResults = await priceHistoryService.populateAllAssets();

    console.log('\n✓ Resumen de precios generados por asset:');
    assetResults.forEach((result) => {
      if (result.success) {
        console.log(`   ✓ ${result.name}: ${result.pricesGenerated} precios`);
      } else {
        console.log(`   ✗ ${result.name}: ${result.error}`);
      }
    });

    console.log('\n✅ Seed de precios históricos completado!\n');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedPriceHistory();
    console.log('\n🎉 Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en el seed:', error);
    process.exit(1);
  }
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedPriceHistory };
