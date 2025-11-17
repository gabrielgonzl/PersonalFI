/**
 * Script de prueba para verificar endpoints de RapidAPI
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

console.log('\n🔍 Testing RapidAPI Configuration...\n');
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
    console.log(`   Sample data:`, JSON.stringify(response.data, null, 2).substring(0, 500));
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
  const startTimestamp = Math.floor(new Date('2023-01-01').getTime() / 1000);
  const endTimestamp = Math.floor(new Date().getTime() / 1000);

  // Test 1: Chart endpoint (might be what's being called)
  await testEndpoint(
    `/chart/${symbol}`,
    { period1: startTimestamp, period2: endTimestamp, interval: '1d' },
    'Chart endpoint with path parameter'
  );

  // Test 2: Historical data endpoint (current code)
  await testEndpoint(
    '/api/stock/get-historical-data',
    { symbol: symbol, period1: startTimestamp, period2: endTimestamp, interval: '1d' },
    'Historical data endpoint'
  );

  // Test 3: Historical prices (alternative)
  await testEndpoint(
    '/stock/get-historical-prices',
    { symbol: symbol, period1: startTimestamp, period2: endTimestamp, interval: '1d' },
    'Historical prices endpoint'
  );

  // Test 4: Quote endpoint (for current price)
  await testEndpoint('/stock/get-quote', { symbol: symbol }, 'Quote endpoint');

  // Test 5: Try with query params
  await testEndpoint(
    '/chart',
    { symbol: symbol, period1: startTimestamp, period2: endTimestamp, interval: '1d' },
    'Chart endpoint with query parameter'
  );

  console.log('\n✅ Testing complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
