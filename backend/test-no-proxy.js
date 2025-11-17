/**
 * Test bypassing proxy for RapidAPI
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

console.log('\n🔍 Testing with proxy bypass...\n');

async function testWithoutProxy() {
  console.log('Testing with proxy: false\n');

  try {
    const response = await axios({
      method: 'GET',
      url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers',
      params: {
        page: 1,
        type: 'STOCKS'
      },
      headers: {
        'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      proxy: false,  // Bypass proxy
      timeout: 10000
    });

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Meta:', response.data.meta);
    console.log('Stocks found:', response.data.body?.length);
    console.log('');
    console.log('First 3 stocks:');
    response.data.body.slice(0, 3).forEach(stock => {
      console.log(`  ${stock.symbol}: ${stock.name}`);
      console.log(`    Price: ${stock.lastsale}, Change: ${stock.pctchange}`);
    });

    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status || error.code);
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

testWithoutProxy().then(success => {
  if (success) {
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ SOLUTION FOUND!');
    console.log('\nThe proxy configuration was blocking axios requests.');
    console.log('Solution: Add `proxy: false` to axios config\n');
    console.log('Now I will update priceService.js with this fix.');
  } else {
    console.log('\n❌ Still failing. Need to investigate further.');
  }
});
