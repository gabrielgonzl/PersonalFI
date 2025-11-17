/**
 * Test different User-Agent configurations
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

console.log('\n🔍 Testing different User-Agent configurations...\n');

async function testUserAgent(userAgent, description) {
  console.log(`Testing: ${description}`);
  console.log(`User-Agent: ${userAgent || '(removed)'}`);

  try {
    const headers = {
      'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    };

    // Si userAgent es null, no lo añadimos
    // Si userAgent es string, lo añadimos
    if (userAgent !== null) {
      headers['User-Agent'] = userAgent;
    }

    const response = await axios({
      method: 'GET',
      url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers',
      params: {
        page: 1,
        type: 'STOCKS'
      },
      headers: headers,
      timeout: 10000
    });

    console.log('✅ SUCCESS!');
    console.log('   Status:', response.status);
    console.log('   Stocks:', response.data.body?.length);
    console.log('   First:', response.data.body[0]?.symbol);
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('   Status:', error.response?.status || error.code);
    console.log('   Error:', error.response?.data || error.message);
    console.log('');
    return false;
  }
}

async function main() {
  const tests = [
    [null, 'No User-Agent (default axios)'],
    ['curl/8.5.0', 'Mimicking curl'],
    ['Mozilla/5.0', 'Browser-like'],
    ['', 'Empty User-Agent'],
    ['PostmanRuntime/7.26.8', 'Postman-like'],
    ['node', 'Simple "node"'],
  ];

  const results = [];

  for (const [userAgent, description] of tests) {
    const success = await testUserAgent(userAgent, description);
    results.push({ userAgent, description, success });
  }

  console.log('='.repeat(70));
  console.log('\n📊 RESULTS:\n');

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.description}`);
  });

  const working = results.filter(r => r.success);
  if (working.length > 0) {
    console.log('\n✅ Found working configuration(s)!');
    working.forEach(r => {
      console.log(`   User-Agent: "${r.userAgent || '(axios default)'}"`);
    });
  } else {
    console.log('\n❌ No working configuration found');
    console.log('\nThis suggests the issue is NOT the User-Agent.');
    console.log('The API might be:');
    console.log('  1. Blocking requests from this server/IP');
    console.log('  2. Requiring additional authentication');
    console.log('  3. Having different behavior for curl vs other clients');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
