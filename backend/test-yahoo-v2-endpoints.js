/**
 * Explorar endpoints v2 de Yahoo Finance API
 * Para encontrar los correctos para quote y historical data
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Exploring Yahoo Finance v2 API endpoints...\n');

async function testEndpoint(endpoint, description) {
  console.log(`\n📡 ${description}`);
  console.log(`   Endpoint: ${endpoint}`);

  try {
    const response = await axios({
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}${endpoint}`,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      timeout: 10000,
    });

    console.log(`   ✅ SUCCESS! Status: ${response.status}`);
    console.log(`   Response preview:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.status || error.code} - ${error.message}`);
    return { success: false };
  }
}

async function main() {
  const symbol = 'SPY';

  console.log('Testing endpoints for symbol:', symbol);
  console.log('');

  // Test different endpoint patterns
  await testEndpoint(`/api/v2/quote/${symbol}`, 'Quote for specific symbol (path param)');
  await testEndpoint(`/api/v2/quote?symbol=${symbol}`, 'Quote for specific symbol (query param)');
  await testEndpoint(`/api/v2/stock/quote/${symbol}`, 'Stock quote endpoint');
  await testEndpoint(`/api/v2/market/quote/${symbol}`, 'Market quote endpoint');

  // Historical data endpoints
  const startDate = Math.floor(new Date('2024-01-01').getTime() / 1000);
  const endDate = Math.floor(new Date().getTime() / 1000);

  await testEndpoint(
    `/api/v2/historical/${symbol}?period1=${startDate}&period2=${endDate}`,
    'Historical data with period timestamps'
  );

  await testEndpoint(
    `/api/v2/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`,
    'Chart data with interval'
  );

  await testEndpoint(
    `/api/v2/stock/historical/${symbol}?from=2024-01-01&to=2025-11-17`,
    'Historical with date strings'
  );

  // Search endpoint
  await testEndpoint(`/api/v2/search?query=${symbol}`, 'Search for symbol');
  await testEndpoint(`/api/v2/search/${symbol}`, 'Search with path param');

  console.log('\n✅ Endpoint exploration complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
