/**
 * Seeder para poblar la base de datos con datos de prueba
 *
 * Uso:
 * node src/scripts/seed.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar path para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Importar modelos
import Portfolio from '../models/Portfolio.js';
import Asset from '../models/Asset.js';
import Contribution from '../models/Contribution.js';
import Settings from '../models/Settings.js';

// Datos de prueba
const portfoliosData = [
  {
    name: 'Cartera Principal',
    description: 'Mi cartera de inversión principal a largo plazo',
    cashBalance: 5000,
    currency: 'EUR',
    color: '#10B981',
    icon: '💼',
  },
  {
    name: 'Cartera Crypto',
    description: 'Inversiones en criptomonedas',
    cashBalance: 2500,
    currency: 'EUR',
    color: '#F59E0B',
    icon: '₿',
  },
];

const assetsData = [
  // Cartera Principal
  {
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'stock',
    currency: 'EUR',
    currentPrice: 175.50,
    color: '#A3AAAE',
    icon: '🍎',
    notes: 'Tecnología - Acciones de Apple',
    portfolioIndex: 0,
    contributions: [
      { type: 'buy', quantity: 10, pricePerUnit: 150.00, fees: 5, date: new Date('2024-01-15') },
      { type: 'buy', quantity: 5, pricePerUnit: 165.00, fees: 2.5, date: new Date('2024-06-10') },
    ],
  },
  {
    name: 'Vanguard S&P 500 ETF',
    symbol: 'VOO',
    type: 'etf',
    currency: 'EUR',
    currentPrice: 385.75,
    color: '#991B1B',
    icon: '📈',
    notes: 'ETF que replica el S&P 500',
    portfolioIndex: 0,
    contributions: [
      { type: 'buy', quantity: 15, pricePerUnit: 350.00, fees: 10, date: new Date('2024-02-01') },
      { type: 'buy', quantity: 8, pricePerUnit: 370.00, fees: 6, date: new Date('2024-07-15') },
    ],
  },
  {
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    type: 'stock',
    currency: 'EUR',
    currentPrice: 378.90,
    color: '#0078D4',
    icon: '🪟',
    notes: 'Tecnología - Acciones de Microsoft',
    portfolioIndex: 0,
    contributions: [
      { type: 'buy', quantity: 12, pricePerUnit: 340.00, fees: 8, date: new Date('2024-03-10') },
    ],
  },

  // Cartera Crypto
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'crypto',
    currency: 'EUR',
    currentPrice: 42500.00,
    color: '#F7931A',
    icon: '₿',
    notes: 'La primera y más grande criptomoneda',
    portfolioIndex: 1,
    contributions: [
      { type: 'buy', quantity: 0.5, pricePerUnit: 35000.00, fees: 50, date: new Date('2024-01-20') },
      { type: 'buy', quantity: 0.3, pricePerUnit: 40000.00, fees: 35, date: new Date('2024-05-15') },
    ],
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'crypto',
    currency: 'EUR',
    currentPrice: 2250.00,
    color: '#627EEA',
    icon: 'Ξ',
    notes: 'Plataforma de contratos inteligentes',
    portfolioIndex: 1,
    contributions: [
      { type: 'buy', quantity: 5, pricePerUnit: 2000.00, fees: 25, date: new Date('2024-02-05') },
      { type: 'buy', quantity: 3, pricePerUnit: 2100.00, fees: 18, date: new Date('2024-06-20') },
    ],
  },
  {
    name: 'Cardano',
    symbol: 'ADA',
    type: 'crypto',
    currency: 'EUR',
    currentPrice: 0.45,
    color: '#0033AD',
    icon: '🔷',
    notes: 'Blockchain de tercera generación',
    portfolioIndex: 1,
    contributions: [
      { type: 'buy', quantity: 10000, pricePerUnit: 0.35, fees: 10, date: new Date('2024-03-01') },
      { type: 'buy', quantity: 5000, pricePerUnit: 0.40, fees: 8, date: new Date('2024-07-10') },
    ],
  },
];

const settingsData = {
  defaultCurrency: 'EUR',
  language: 'es',
  theme: 'auto',
  chartType: 'area',
  priceUpdateInterval: 15,
  priceApiProvider: 'manual',
};

/**
 * Conectar a MongoDB
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/growing';

    console.log('🔄 Conectando a MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales

    await mongoose.connect(mongoUri);

    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

/**
 * Limpiar la base de datos
 */
async function clearDatabase() {
  try {
    console.log('\n🗑️  Limpiando base de datos...');

    await Promise.all([
      Portfolio.deleteMany({}),
      Asset.deleteMany({}),
      Contribution.deleteMany({}),
      Settings.deleteMany({}),
    ]);

    console.log('✅ Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error.message);
    throw error;
  }
}

/**
 * Crear portfolios
 */
async function createPortfolios() {
  try {
    console.log('\n📁 Creando portfolios...');

    const portfolios = await Portfolio.insertMany(portfoliosData);

    console.log(`✅ ${portfolios.length} portfolios creados`);
    portfolios.forEach(p => console.log(`   - ${p.name} (${p.currency})`));

    return portfolios;
  } catch (error) {
    console.error('❌ Error creando portfolios:', error.message);
    throw error;
  }
}

/**
 * Crear assets y sus contribuciones
 */
async function createAssetsAndContributions(portfolios) {
  try {
    console.log('\n💎 Creando assets y contribuciones...');

    const createdAssets = [];
    const createdContributions = [];

    for (const assetData of assetsData) {
      // Extraer datos de contribuciones
      const { contributions, portfolioIndex, ...assetFields } = assetData;

      // Asignar portfolio
      const portfolio = portfolios[portfolioIndex];
      assetFields.portfolioId = portfolio._id;

      // Crear asset
      const asset = new Asset(assetFields);

      // Crear contribuciones y calcular métricas
      let totalInvested = 0;
      let totalQuantity = 0;

      for (const contribData of contributions) {
        const contribution = new Contribution({
          assetId: asset._id,
          portfolioId: portfolio._id,
          type: contribData.type,
          quantity: contribData.quantity,
          pricePerUnit: contribData.pricePerUnit,
          fees: contribData.fees,
          date: contribData.date,
          notes: `${contribData.type === 'buy' ? 'Compra' : 'Venta'} de ${contribData.quantity} unidades`,
        });

        // Calcular totalAmount
        contribution.totalAmount = (contribData.quantity * contribData.pricePerUnit) + contribData.fees;

        await contribution.save();
        createdContributions.push(contribution);

        // Actualizar métricas del asset
        if (contribData.type === 'buy') {
          totalInvested += contribution.totalAmount;
          totalQuantity += contribData.quantity;
        } else if (contribData.type === 'sell') {
          totalQuantity -= contribData.quantity;
        }

        // Reducir cash del portfolio
        portfolio.cashBalance -= contribution.totalAmount;
      }

      // Actualizar asset con métricas calculadas
      asset.totalInvested = totalInvested;
      asset.quantity = totalQuantity;
      asset.currentValue = totalQuantity * asset.currentPrice;

      // Guardar asset (esto ejecutará el pre-save hook que calcula averagePrice, profitLoss, etc.)
      await asset.save();
      createdAssets.push(asset);

      // Actualizar métricas del portfolio
      portfolio.totalInvested += asset.totalInvested;
      portfolio.currentValue += asset.currentValue;

      console.log(`   ✓ ${asset.symbol}: ${asset.quantity} unidades (${contributions.length} contribuciones)`);
    }

    // Guardar portfolios actualizados (esto ejecutará el pre-save hook)
    await Promise.all(portfolios.map(p => p.save()));

    console.log(`✅ ${createdAssets.length} assets creados`);
    console.log(`✅ ${createdContributions.length} contribuciones creadas`);

    return { assets: createdAssets, contributions: createdContributions };
  } catch (error) {
    console.error('❌ Error creando assets:', error.message);
    throw error;
  }
}

/**
 * Crear configuración
 */
async function createSettings() {
  try {
    console.log('\n⚙️  Creando configuración...');

    const settings = await Settings.create(settingsData);

    console.log('✅ Configuración creada');
    console.log(`   - Moneda: ${settings.defaultCurrency}`);
    console.log(`   - Idioma: ${settings.language}`);
    console.log(`   - Tema: ${settings.theme}`);

    return settings;
  } catch (error) {
    console.error('❌ Error creando configuración:', error.message);
    throw error;
  }
}

/**
 * Mostrar resumen
 */
async function showSummary() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE DATOS CREADOS');
    console.log('='.repeat(60));

    // Contar documentos
    const [portfolioCount, assetCount, contributionCount] = await Promise.all([
      Portfolio.countDocuments(),
      Asset.countDocuments(),
      Contribution.countDocuments(),
    ]);

    console.log(`\n📁 Portfolios: ${portfolioCount}`);
    console.log(`💎 Assets: ${assetCount}`);
    console.log(`📝 Contribuciones: ${contributionCount}`);

    // Mostrar portfolios con detalles
    const portfolios = await Portfolio.find().sort({ createdAt: 1 });

    console.log('\n' + '-'.repeat(60));
    console.log('DETALLE DE PORTFOLIOS');
    console.log('-'.repeat(60));

    for (const portfolio of portfolios) {
      const assets = await Asset.find({ portfolioId: portfolio._id });

      console.log(`\n${portfolio.icon} ${portfolio.name}`);
      console.log(`   Efectivo disponible: €${portfolio.cashBalance.toFixed(2)}`);
      console.log(`   Total invertido: €${portfolio.totalInvested.toFixed(2)}`);
      console.log(`   Valor actual: €${portfolio.currentValue.toFixed(2)}`);
      console.log(`   Valor total: €${portfolio.totalValue.toFixed(2)}`);
      console.log(`   P/L: €${portfolio.profitLoss.toFixed(2)} (${portfolio.profitLossPercentage.toFixed(2)}%)`);
      console.log(`   Assets: ${assets.length}`);

      assets.forEach(asset => {
        console.log(`      - ${asset.symbol}: ${asset.quantity} unidades @ €${asset.currentPrice} = €${asset.currentValue.toFixed(2)}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ¡Seeder completado exitosamente!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error mostrando resumen:', error.message);
    throw error;
  }
}

/**
 * Ejecutar seeder
 */
async function seed() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 GROWING - DATABASE SEEDER');
    console.log('='.repeat(60));

    // Conectar a DB
    await connectDB();

    // Limpiar DB
    await clearDatabase();

    // Crear datos
    const portfolios = await createPortfolios();
    await createAssetsAndContributions(portfolios);
    await createSettings();

    // Mostrar resumen
    await showSummary();

  } catch (error) {
    console.error('\n❌ Error ejecutando seeder:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada\n');
  }
}

// Ejecutar seeder
seed();
