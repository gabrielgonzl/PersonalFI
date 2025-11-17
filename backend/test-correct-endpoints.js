/**
 * Probar los endpoints correctos según la documentación de la API
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Testing correct API endpoints from documentation...\n');

async function testEndpoint(endpoint, params, description) {
  console.log(`\n📡 ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Params:`, params);

  try {
    const response = await axios({
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}${endpoint}`,
      params: params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      timeout: 15000,
    });

    console.log(`   ✅ SUCCESS! Status: ${response.status}`);
    console.log(`   Response structure:`, JSON.stringify(response.data, null, 2).substring(0, 1500));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.status || error.code} - ${error.message}`);
    if (error.response?.data) {
      console.log(`   Error details:`, error.response.data);
    }
    return { success: false };
  }
}

async function main() {
  const symbol = 'SPY';

  // Test 1: Real-time quote
  console.log('\n═══════════════════════════════════════');
  console.log('  Testing REAL-TIME QUOTES');
  console.log('═══════════════════════════════════════');

  await testEndpoint(
    '/v1/market/quotes',
    { ticker: symbol },
    'Get real-time quote (single symbol with ticker param)'
  );

  await testEndpoint(
    '/v1/market/quotes',
    { symbols: symbol },
    'Get real-time quote (single symbol with symbols param)'
  );

  await testEndpoint(
    '/v1/market/quotes',
    { ticker: `${symbol},AAPL,MSFT` },
    'Get real-time quotes (multiple symbols)'
  );

  // Test 2: Historical data
  console.log('\n═══════════════════════════════════════');
  console.log('  Testing HISTORICAL DATA');
  console.log('═══════════════════════════════════════');

  await testEndpoint(
    '/v2/stock/history',
    {
      ticker: symbol,
      period: '1y',
      interval: '1d'
    },
    'Get historical data v2 (period-based)'
  );

  await testEndpoint(
    '/v1/stock/history',
    {
      ticker: symbol,
      start: '2024-01-01',
      end: '2024-12-31'
    },
    'Get historical data v1 (date range)'
  );

  // Test 3: Search
  console.log('\n═══════════════════════════════════════');
  console.log('  Testing SEARCH');
  console.log('═══════════════════════════════════════');

  await testEndpoint(
    '/v1/search',
    { query: 'Apple' },
    'Search for symbols by name'
  );

  console.log('\n✅ Testing complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Identify which parameter names work (ticker vs symbols)');
  console.log('   2. Understand response structure');
  console.log('   3. Update priceService.js with correct endpoints\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
