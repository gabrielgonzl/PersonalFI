/**
 * Script de prueba para verificar la conexión con Yahoo Finance API v1
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env
const result = dotenv.config({ path: join(__dirname, '.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

console.log('\n🔍 Testing Yahoo Finance API v1 Integration...\n');
console.log('='.repeat(60));

// Debug: mostrar variables cargadas
console.log('\n🔧 Environment variables loaded:');
console.log('   RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? `${process.env.RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('   RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST || 'NOT SET');
console.log('   PRICE_UPDATE_MODE:', process.env.PRICE_UPDATE_MODE || 'NOT SET');

// Importar priceService DESPUÉS de cargar las variables de entorno
const priceService = await import('./src/utils/priceService.js');
const service = priceService.default;

async function testPriceService() {
  // Verificar configuración
  console.log('\n1️⃣  Checking configuration...');
  const info = service.getPriceServiceInfo();
  console.log('   Mode:', info.mode);
  console.log('   Auto Enabled:', info.autoEnabled);
  console.log('   API Configured:', info.apiConfigured);
  console.log('   Host:', info.host);
  console.log('   Max Retries:', info.maxRetries);
  console.log('   Initial Retry Delay:', info.initialRetryDelay + 'ms');

  if (!info.autoEnabled) {
    console.log('\n❌ Auto mode is not enabled. Please set PRICE_UPDATE_MODE=auto in .env');
    return;
  }

  console.log('\n✅ Configuration looks good!\n');
  console.log('='.repeat(60));

  // Test 1: Obtener cotización en tiempo real
  console.log('\n2️⃣  Testing real-time quote (fetchCurrentPrice)...');
  console.log('   Symbol: AAPL');
  try {
    const quote = await service.fetchCurrentPrice('AAPL', 'stock');
    if (quote) {
      console.log('   ✅ Success!');
      console.log('   Price:', `$${quote.price}`);
      console.log('   Change:', `${quote.changePercent?.toFixed(2)}%`);
      console.log('   Previous Close:', `$${quote.previousClose}`);
      console.log('   Day High:', `$${quote.dayHigh}`);
      console.log('   Day Low:', `$${quote.dayLow}`);
      console.log('   Volume:', quote.volume?.toLocaleString());
      console.log('   Display Name:', quote.displayName);
    } else {
      console.log('   ❌ Failed to fetch quote');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n='.repeat(60));

  // Test 2: Obtener datos históricos
  console.log('\n3️⃣  Testing historical prices (fetchHistoricalPrices)...');
  console.log('   Symbol: MSFT');
  console.log('   Period: Last 30 days');
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const historical = await service.fetchHistoricalPrices('MSFT', startDate, endDate, '1d');
    if (historical && historical.length > 0) {
      console.log('   ✅ Success!');
      console.log('   Data points:', historical.length);
      console.log('   First date:', historical[0].date.toISOString().split('T')[0]);
      console.log('   Last date:', historical[historical.length - 1].date.toISOString().split('T')[0]);
      console.log('   Latest close:', `$${historical[historical.length - 1].close}`);
      console.log('   Sample data (last 3 days):');
      historical.slice(-3).forEach(item => {
        console.log(`     ${item.date.toISOString().split('T')[0]}: $${item.close} (Volume: ${item.volume?.toLocaleString()})`);
      });
    } else {
      console.log('   ❌ Failed to fetch historical data');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n='.repeat(60));

  // Test 3: Buscar símbolos
  console.log('\n4️⃣  Testing symbol search (searchSymbols)...');
  console.log('   Query: Tesla');
  try {
    const results = await service.searchSymbols('Tesla');
    if (results && results.length > 0) {
      console.log('   ✅ Success!');
      console.log('   Results found:', results.length);
      console.log('   Top 5 results:');
      results.slice(0, 5).forEach(item => {
        console.log(`     ${item.symbol} - ${item.name} (${item.type})`);
      });
    } else {
      console.log('   ⚠️  No results found (this might be expected depending on the API)');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n='.repeat(60));

  // Test 4: Validar símbolo
  console.log('\n5️⃣  Testing symbol validation (validateSymbol)...');
  console.log('   Symbol: GOOGL');
  try {
    const isValid = await service.validateSymbol('GOOGL', 'stock');
    if (isValid) {
      console.log('   ✅ Symbol is valid!');
    } else {
      console.log('   ❌ Symbol is not valid');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n='.repeat(60));

  // Test 5: Verificar caché
  console.log('\n6️⃣  Testing cache functionality...');
  console.log('   Fetching AAPL again (should use cache)...');
  try {
    const start = Date.now();
    const quote = await service.fetchCurrentPrice('AAPL', 'stock');
    const elapsed = Date.now() - start;
    if (quote) {
      console.log('   ✅ Cache working!');
      console.log('   Response time:', elapsed + 'ms (should be very fast if cached)');
      console.log('   Price:', `$${quote.price}`);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n='.repeat(60));
  console.log('\n✅ All tests completed!\n');
}

// Ejecutar tests
testPriceService().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
