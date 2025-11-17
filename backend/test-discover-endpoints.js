/**
 * Script para descubrir los endpoints correctos de yahoo-finance15 API
 * Prueba diferentes combinaciones basadas en documentación común
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Discovering Yahoo Finance15 API Endpoints...\n');
console.log('API Key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('API Host:', RAPIDAPI_HOST);
console.log('\n' + '='.repeat(70) + '\n');

async function testEndpoint(method, endpoint, params = {}) {
  const url = `https://${RAPIDAPI_HOST}${endpoint}`;

  try {
    const response = await axios({
      method: method,
      url: url,
      params: params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      timeout: 10000,
    });

    console.log(`✅ SUCCESS: ${method} ${endpoint}`);
    if (params && Object.keys(params).length > 0) {
      console.log(`   Params: ${JSON.stringify(params)}`);
    }
    console.log(`   Status: ${response.status}`);
    console.log(`   Response preview: ${JSON.stringify(response.data).substring(0, 300)}...`);
    console.log('');
    return { success: true, endpoint, method, params, data: response.data };
  } catch (error) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data || error.message;
    console.log(`❌ FAILED: ${method} ${endpoint} [${status}]`);
    if (params && Object.keys(params).length > 0) {
      console.log(`   Params: ${JSON.stringify(params)}`);
    }
    if (typeof message === 'string') {
      console.log(`   Error: ${message.substring(0, 100)}`);
    } else {
      console.log(`   Error: ${JSON.stringify(message).substring(0, 100)}`);
    }
    console.log('');
    return { success: false, endpoint, method, params, status, error: message };
  }
}

async function main() {
  const results = {
    working: [],
    failed: []
  };

  console.log('📡 Testing QUOTE endpoints...\n');

  // Quotes - diferentes variaciones
  const quoteTests = [
    ['GET', '/api/yahoo/qu/quote', { symbols: 'AAPL' }],
    ['GET', '/api/yahoo/qu/quote/AAPL', {}],
    ['GET', '/quote', { symbol: 'AAPL' }],
    ['GET', '/quotes', { symbols: 'AAPL' }],
    ['GET', '/api/v1/quote', { symbol: 'AAPL' }],
    ['GET', '/api/v2/quote', { symbol: 'AAPL' }],
    ['GET', '/market/v2/get-quotes', { symbols: 'AAPL' }],
    ['GET', '/market/get-quotes', { symbols: 'AAPL' }],
  ];

  for (const [method, endpoint, params] of quoteTests) {
    const result = await testEndpoint(method, endpoint, params);
    if (result.success) {
      results.working.push(result);
    } else {
      results.failed.push(result);
    }
  }

  console.log('='.repeat(70) + '\n');
  console.log('📊 Testing HISTORICAL endpoints...\n');

  // Historical - diferentes variaciones
  const historicalTests = [
    ['GET', '/api/yahoo/hi/history', { symbol: 'AAPL' }],
    ['GET', '/api/yahoo/hi/history/AAPL', {}],
    ['GET', '/history', { symbol: 'AAPL', interval: '1d' }],
    ['GET', '/chart', { symbol: 'AAPL', range: '1mo' }],
    ['GET', '/api/v1/historical', { symbol: 'AAPL' }],
    ['GET', '/api/v2/historical', { symbol: 'AAPL' }],
    ['GET', '/market/v2/get-chart', { symbol: 'AAPL', range: '1mo' }],
  ];

  for (const [method, endpoint, params] of historicalTests) {
    const result = await testEndpoint(method, endpoint, params);
    if (result.success) {
      results.working.push(result);
    } else {
      results.failed.push(result);
    }
  }

  console.log('='.repeat(70) + '\n');
  console.log('🔎 Testing SEARCH endpoints...\n');

  // Search - diferentes variaciones
  const searchTests = [
    ['GET', '/api/yahoo/se/search', { q: 'Tesla' }],
    ['GET', '/search', { q: 'Tesla' }],
    ['GET', '/search', { query: 'Tesla' }],
    ['GET', '/api/v1/autocomplete', { q: 'Tesla' }],
    ['GET', '/market/v2/auto-complete', { q: 'Tesla' }],
  ];

  for (const [method, endpoint, params] of searchTests) {
    const result = await testEndpoint(method, endpoint, params);
    if (result.success) {
      results.working.push(result);
    } else {
      results.failed.push(result);
    }
  }

  // Summary
  console.log('='.repeat(70) + '\n');
  console.log('📋 SUMMARY\n');
  console.log(`✅ Working endpoints: ${results.working.length}`);
  console.log(`❌ Failed endpoints: ${results.failed.length}`);
  console.log('');

  if (results.working.length > 0) {
    console.log('✅ WORKING ENDPOINTS:\n');
    results.working.forEach(r => {
      console.log(`   ${r.method} ${r.endpoint}`);
      if (Object.keys(r.params).length > 0) {
        console.log(`      Params: ${JSON.stringify(r.params)}`);
      }
    });
    console.log('');
  }

  if (results.working.length === 0) {
    console.log('⚠️  No working endpoints found!');
    console.log('');
    console.log('Possible reasons:');
    console.log('  1. API key is not subscribed to yahoo-finance15');
    console.log('  2. Different API version/provider needed');
    console.log('  3. Endpoints use different naming convention');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Check RapidAPI documentation: https://rapidapi.com/');
    console.log('  2. Verify API subscription');
    console.log('  3. Check API documentation for correct endpoints');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
