/**
 * Probar usando exactamente el código que compartió el usuario
 * Usando el módulo https nativo de Node.js
 */
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';

console.log('\n🔍 Testing with native Node.js https module...\n');
console.log('API Key:', RAPIDAPI_KEY);
console.log('API Host:', RAPIDAPI_HOST);
console.log('');

const options = {
  method: 'GET',
  hostname: RAPIDAPI_HOST,
  port: null,
  path: '/api/v2/markets/tickers?page=1&type=STOCKS',
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
};

console.log('Request options:', JSON.stringify(options, null, 2));
console.log('');

const req = https.request(options, function (res) {
  const chunks = [];

  console.log('Response status:', res.statusCode);
  console.log('Response headers:', res.headers);
  console.log('');

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    const bodyString = body.toString();

    if (res.statusCode === 200) {
      console.log('✅ SUCCESS!');
      console.log('Response (first 2000 chars):');
      console.log(bodyString.substring(0, 2000));
    } else {
      console.log('❌ FAILED!');
      console.log('Response body:', bodyString);
    }
  });
});

req.on('error', function (error) {
  console.error('❌ Request error:', error);
});

req.end();
