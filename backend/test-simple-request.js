/**
 * Test simple para verificar la API key y headers
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Simple API Test\n');
console.log('API Key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('API Host:', RAPIDAPI_HOST);
console.log('');

async function testSimpleRequest() {
  console.log('Testing with headers:');
  console.log('  x-rapidapi-key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('  x-rapidapi-host:', RAPIDAPI_HOST);
  console.log('');

  const endpoints = [
    '/api/v2/markets/tickers?page=1&type=STOCKS',
    '/api/v1/market/quotes?ticker=AAPL',
    '/v1/market/quotes?ticker=AAPL',
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`);
    const url = `https://${RAPIDAPI_HOST}${endpoint}`;
    console.log(`Full URL: ${url}`);

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        timeout: 10000,
      });

      console.log('✅ SUCCESS!');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data).substring(0, 500));
    } catch (error) {
      console.log('❌ FAILED');
      console.log('Status:', error.response?.status || 'N/A');
      console.log('Error:', error.message);
      console.log('Response:', error.response?.data);

      if (error.response?.status === 403) {
        console.log('\n⚠️  403 Access Denied - Possible causes:');
        console.log('   1. API key is invalid or expired');
        console.log('   2. Not subscribed to this API on RapidAPI');
        console.log('   3. API plan does not include these endpoints');
        console.log('   4. Rate limit exceeded');
        console.log('\n📝 Next steps:');
        console.log('   1. Verify your subscription at https://rapidapi.com/');
        console.log('   2. Check if yahoo-finance15 API is in your subscriptions');
        console.log('   3. Ensure your API plan includes the endpoints you need');
      }
    }
  }
}

testSimpleRequest().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
