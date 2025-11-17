/**
 * Explorar endpoints basados en la estructura /api/v2/markets/
 * Ya que sabemos que /api/v2/markets/tickers funciona
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Exploring /api/v2/markets/ endpoints...\n');

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
    console.log(`   Response preview:`, JSON.stringify(response.data, null, 2).substring(0, 800));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.status || error.code} - ${error.message}`);
    return { success: false };
  }
}

async function main() {
  const symbol = 'SPY';

  // Test variations of markets endpoints
  await testEndpoint(`/api/v2/markets/tickers?symbol=${symbol}`, 'Markets tickers with symbol filter');
  await testEndpoint(`/api/v2/markets/ticker/${symbol}`, 'Single ticker by symbol');
  await testEndpoint(`/api/v2/markets/quote/${symbol}`, 'Markets quote endpoint');
  await testEndpoint(`/api/v2/markets/quotes?symbols=${symbol}`, 'Markets quotes with symbols param');
  await testEndpoint(`/api/v2/markets/stock/${symbol}`, 'Markets stock endpoint');
  await testEndpoint(`/api/v2/markets/data/${symbol}`, 'Markets data endpoint');

  // Try without /markets/
  await testEndpoint(`/api/v2/ticker/${symbol}`, 'Direct ticker endpoint');
  await testEndpoint(`/api/v2/tickers?symbol=${symbol}`, 'Direct tickers with filter');

  // Try financials/company data
  await testEndpoint(`/api/v2/markets/financials/${symbol}`, 'Financials endpoint');
  await testEndpoint(`/api/v2/markets/company/${symbol}`, 'Company endpoint');

  // Historical/chart variations
  await testEndpoint(`/api/v2/markets/historical/${symbol}`, 'Markets historical endpoint');
  await testEndpoint(`/api/v2/markets/chart/${symbol}`, 'Markets chart endpoint');
  await testEndpoint(`/api/v2/markets/prices/${symbol}`, 'Markets prices endpoint');

  console.log('\n✅ Endpoint exploration complete!\n');
  console.log('📝 If none worked, we may need to:');
  console.log('   1. Check API documentation for correct v2 endpoints');
  console.log('   2. Look for a different endpoint pattern');
  console.log('   3. Use a query parameter approach on /markets/tickers\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
