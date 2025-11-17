/**
 * Probar con fetch nativo de Node.js (similar a curl)
 */
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Testing with native fetch...\n');
console.log('API Key:', RAPIDAPI_KEY);
console.log('API Host:', RAPIDAPI_HOST);
console.log('');

async function testWithFetch() {
  const url = 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers?page=1&type=STOCKS';

  console.log('URL:', url);
  console.log('Headers being sent:', {
    'x-rapidapi-key': RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 20)}...` : 'NOT SET',
    'x-rapidapi-host': RAPIDAPI_HOST,
  });
  console.log('');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('');

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Data preview:');
      console.log(JSON.stringify(data, null, 2).substring(0, 1000));
    } else {
      console.log('❌ FAILED!');
      console.log('Response data:', data);
    }

    return data;
  } catch (error) {
    console.log('❌ Error:', error.message);
    throw error;
  }
}

testWithFetch()
  .then(() => {
    console.log('\n✅ Test completed!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.log('\n❌ Test failed!\n');
    process.exit(1);
  });
