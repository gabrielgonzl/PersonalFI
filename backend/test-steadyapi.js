/**
 * Test de conexión a SteadyAPI
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const STEADYAPI_KEY = process.env.STEADYAPI_KEY;
const STEADYAPI_BASE_URL = process.env.STEADYAPI_BASE_URL || 'https://api.steadyapi.com';

async function testSteadyAPI() {
  console.log('🧪 Testing SteadyAPI Connection\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${STEADYAPI_BASE_URL}`);
  console.log(`  API Key: ${STEADYAPI_KEY ? STEADYAPI_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');

  if (!STEADYAPI_KEY) {
    console.error('❌ STEADYAPI_KEY not configured in .env file');
    process.exit(1);
  }

  try {
    // Construir URL con parámetros
    const url = new URL(`${STEADYAPI_BASE_URL}/v2/markets/stock/history`);
    url.searchParams.append('ticker', 'AAPL');
    url.searchParams.append('interval', '1d');
    url.searchParams.append('limit', '50');

    console.log(`Test 1: Fetching AAPL historical data (last 50 days)...`);
    console.log(`  URL: ${url.toString()}`);
    console.log(`  Headers: Authorization: Bearer ${STEADYAPI_KEY.substring(0, 20)}...`);
    console.log();

    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': `Bearer ${STEADYAPI_KEY}`,
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    console.log('✅ Response received!');
    console.log(`  Status: ${response.status}`);
    console.log(`  Data structure:`, Object.keys(response.data));
    
    if (response.data.meta) {
      console.log(`  Meta:`, response.data.meta);
    }
    
    if (response.data.body && Array.isArray(response.data.body)) {
      console.log(`  Records: ${response.data.body.length}`);
      console.log(`  First record:`, response.data.body[0]);
      console.log(`  Last record:`, response.data.body[response.data.body.length - 1]);
    }

    console.log('\n✅ SteadyAPI test SUCCESSFUL!');

  } catch (error) {
    console.error('\n❌ SteadyAPI test FAILED!');
    console.error('');
    
    if (error.response) {
      console.error('Response Error:');
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Status Text: ${error.response.statusText}`);
      console.error(`  Data:`, JSON.stringify(error.response.data, null, 2));
      console.error(`  Headers:`, error.response.headers);
    } else if (error.request) {
      console.error('Request Error:');
      console.error('  Request was made but no response received');
      console.error(`  Error Code: ${error.code || 'N/A'}`);
      console.error(`  Message: ${error.message}`);
      if (error.cause) {
        console.error('  Cause:', error.cause);
      }
    } else {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }

    process.exit(1);
  }
}

// Run test
testSteadyAPI();
