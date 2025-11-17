/**
 * Script para probar endpoints específicos de yahoo-finance15 API
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Testing yahoo-finance15 API endpoints...\n');
console.log('API Key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('API Host:', RAPIDAPI_HOST);
console.log('');

async function testEndpoint(endpoint, params, description) {
  console.log(`\n📡 Testing: ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Params:`, params);

  try {
    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}${endpoint}`,
      params: params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      timeout: 10000,
    };

    const response = await axios.request(options);
    console.log(`   ✓ Success! Status: ${response.status}`);
    console.log(`   Response keys:`, Object.keys(response.data || {}).slice(0, 10));

    // Mostrar estructura de datos
    if (response.data) {
      console.log(`   Data structure:`, JSON.stringify(response.data, null, 2).substring(0, 800));
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.log(`   ✗ Error: ${error.response?.status || error.code}`);
    console.log(`   Message: ${error.message}`);
    if (error.response?.data) {
      console.log(`   API Response:`, JSON.stringify(error.response.data, null, 2).substring(0, 300));
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  const symbol = 'SPY';

  // Test 1: Markets tickers (sabemos que funciona)
  await testEndpoint(
    '/api/v2/markets/tickers',
    { page: 1, type: 'STOCKS' },
    'Markets tickers endpoint (confirmed working)'
  );

  // Test 2: Quote endpoint variations
  await testEndpoint(
    '/api/v2/quote',
    { symbols: symbol },
    'Quote endpoint v2 with symbols param'
  );

  await testEndpoint(
    `/api/v2/quote/${symbol}`,
    {},
    'Quote endpoint v2 with path param'
  );

  await testEndpoint(
    '/quote',
    { symbol: symbol },
    'Quote endpoint (root level)'
  );

  // Test 3: Historical data variations
  const startDate = Math.floor(new Date('2024-01-01').getTime() / 1000);
  const endDate = Math.floor(new Date().getTime() / 1000);

  await testEndpoint(
    '/api/v2/historical',
    { symbol: symbol, period1: startDate, period2: endDate },
    'Historical endpoint v2'
  );

  await testEndpoint(
    `/api/v2/historical/${symbol}`,
    { period1: startDate, period2: endDate },
    'Historical endpoint v2 with path param'
  );

  await testEndpoint(
    '/api/v2/chart',
    { symbol: symbol, period1: startDate, period2: endDate, interval: '1d' },
    'Chart endpoint v2'
  );

  await testEndpoint(
    `/api/v2/chart/${symbol}`,
    { period1: startDate, period2: endDate, interval: '1d' },
    'Chart endpoint v2 with path param'
  );

  // Test 4: Search endpoint
  await testEndpoint(
    '/api/v2/search',
    { query: 'SPY' },
    'Search endpoint v2'
  );

  console.log('\n✅ Testing complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Identify which endpoints returned data successfully');
  console.log('   2. Update priceService.js to use the correct endpoints');
  console.log('   3. Update fetchHistoricalPrices and fetchCurrentPrice functions\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
