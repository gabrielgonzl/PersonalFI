/**
 * Probar el endpoint EXACTO que funciona en el navegador
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Testing EXACT endpoint from browser...\n');
console.log('API Key:', RAPIDAPI_KEY);
console.log('API Host:', RAPIDAPI_HOST);
console.log('');

async function testExactEndpoint() {
  const endpoint = '/api/v2/markets/tickers';
  const params = { page: 1, type: 'STOCKS' };

  console.log('Testing:', `https://${RAPIDAPI_HOST}${endpoint}`);
  console.log('Params:', params);
  console.log('Headers:', {
    'X-RapidAPI-Key': RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 20)}...` : 'NOT SET',
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  });
  console.log('');

  try {
    const response = await axios({
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}${endpoint}`,
      params: params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('');
    console.log('Response data:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 2000));

    return response.data;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.message);
    console.log('');

    if (error.response) {
      console.log('Response headers:', error.response.headers);
      console.log('Response data:', error.response.data);
    }

    throw error;
  }
}

testExactEndpoint()
  .then(() => {
    console.log('\n✅ Test passed!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.log('\n❌ Test failed!\n');
    process.exit(1);
  });
