/**
 * Test del endpoint que funciona con curl
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Testing WORKING endpoint from curl...\n');

async function testWorkingEndpoint() {
  const url = 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers';

  console.log('Testing:', url);
  console.log('Params: page=1, type=STOCKS');
  console.log('Headers:');
  console.log('  x-rapidapi-key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('  x-rapidapi-host:', RAPIDAPI_HOST);
  console.log('');

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      params: {
        page: 1,
        type: 'STOCKS'
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      timeout: 10000,
    });

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('');
    console.log('Response structure:');
    console.log('  meta:', response.data.meta);
    console.log('  body: array of', response.data.body?.length, 'items');
    console.log('');
    console.log('Sample data (first 3 stocks):');
    response.data.body.slice(0, 3).forEach(stock => {
      console.log(`  ${stock.symbol}: ${stock.name} - ${stock.lastsale} (${stock.pctchange})`);
    });

    return response.data;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status || 'N/A');
    console.log('Error:', error.message);
    console.log('Response:', error.response?.data);
  }
}

async function findQuoteEndpoint() {
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 Now testing QUOTE endpoints based on API structure...\n');

  // Basado en que /api/v2/markets/tickers funciona, probar endpoints similares
  const endpoints = [
    ['/api/v2/markets/quotes', { symbols: 'AAPL' }],
    ['/api/v2/markets/quotes', { ticker: 'AAPL' }],
    ['/api/v2/markets/quotes', { symbol: 'AAPL' }],
    ['/api/v2/markets/quote', { symbol: 'AAPL' }],
    ['/api/v2/quote', { symbol: 'AAPL' }],
    ['/api/v2/quote', { symbols: 'AAPL' }],
    ['/api/yahoo/qu/quote', { symbols: 'AAPL' }],
    ['/api/yahoo/qu/quote/AAPL', {}],
  ];

  for (const [endpoint, params] of endpoints) {
    const url = `https://${RAPIDAPI_HOST}${endpoint}`;
    console.log(`Testing: ${endpoint}`);
    console.log(`  Params: ${JSON.stringify(params)}`);

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        params: params,
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        timeout: 10000,
      });

      console.log(`  ✅ SUCCESS! Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      console.log('');
      return { endpoint, params, data: response.data };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response?.data || error.message);
      console.log(`  ❌ [${status}] ${message.substring(0, 80)}`);
    }
  }
}

async function findHistoricalEndpoint() {
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 Testing HISTORICAL endpoints...\n');

  const endpoints = [
    ['/api/v2/markets/history', { symbol: 'AAPL' }],
    ['/api/v2/markets/chart', { symbol: 'AAPL' }],
    ['/api/v2/historical', { symbol: 'AAPL' }],
    ['/api/v2/chart', { symbol: 'AAPL', range: '1mo' }],
    ['/api/yahoo/hi/history', { symbol: 'AAPL' }],
    ['/api/yahoo/hi/history/AAPL', {}],
  ];

  for (const [endpoint, params] of endpoints) {
    const url = `https://${RAPIDAPI_HOST}${endpoint}`;
    console.log(`Testing: ${endpoint}`);
    console.log(`  Params: ${JSON.stringify(params)}`);

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        params: params,
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        timeout: 10000,
      });

      console.log(`  ✅ SUCCESS! Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      console.log('');
      return { endpoint, params, data: response.data };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response?.data || error.message);
      console.log(`  ❌ [${status}] ${message.substring(0, 80)}`);
    }
  }
}

async function main() {
  // Test endpoint conocido que funciona
  await testWorkingEndpoint();

  // Buscar endpoint de quotes
  const quoteResult = await findQuoteEndpoint();

  // Buscar endpoint histórico
  const historicalResult = await findHistoricalEndpoint();

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ RESULTS:\n');

  if (quoteResult) {
    console.log('✅ Quote endpoint found:', quoteResult.endpoint);
    console.log('   Params:', JSON.stringify(quoteResult.params));
  } else {
    console.log('❌ No quote endpoint found');
  }

  if (historicalResult) {
    console.log('✅ Historical endpoint found:', historicalResult.endpoint);
    console.log('   Params:', JSON.stringify(historicalResult.params));
  } else {
    console.log('❌ No historical endpoint found');
  }

  console.log('');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
