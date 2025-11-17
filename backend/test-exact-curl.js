/**
 * Replicar exactamente el curl que funciona
 */
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

console.log('\n🔍 Replicating exact curl request...\n');

// Método 1: axios con configuración mínima
async function testWithAxiosMinimal() {
  console.log('1️⃣  Testing with axios (minimal config)...\n');

  try {
    const response = await axios.get('https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers', {
      params: {
        page: 1,
        type: 'STOCKS'
      },
      headers: {
        'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    });

    console.log('✅ SUCCESS with axios!');
    console.log('Status:', response.status);
    console.log('Stocks found:', response.data.body?.length);
    console.log('First stock:', response.data.body[0]);
    return true;
  } catch (error) {
    console.log('❌ FAILED with axios');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    console.log('');
    return false;
  }
}

// Método 2: Node.js https nativo
async function testWithNodeHttps() {
  console.log('2️⃣  Testing with native Node.js https...\n');

  return new Promise((resolve) => {
    const options = {
      hostname: 'yahoo-finance15.p.rapidapi.com',
      port: 443,
      path: '/api/v2/markets/tickers?page=1&type=STOCKS',
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('✅ SUCCESS with https!');
          console.log('Status:', res.statusCode);
          console.log('Stocks found:', parsed.body?.length);
          console.log('First stock:', parsed.body[0]);
          resolve(true);
        } else {
          console.log('❌ FAILED with https');
          console.log('Status:', res.statusCode);
          console.log('Error:', data);
          console.log('');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ ERROR with https:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Método 3: Axios con todos los headers posibles
async function testWithAxiosFull() {
  console.log('3️⃣  Testing with axios (full headers)...\n');

  try {
    const response = await axios({
      method: 'GET',
      url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers?page=1&type=STOCKS',
      headers: {
        'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    console.log('✅ SUCCESS with axios (full)!');
    console.log('Status:', response.status);
    console.log('Stocks found:', response.data.body?.length);
    console.log('First stock:', response.data.body[0]);
    return true;
  } catch (error) {
    console.log('❌ FAILED with axios (full)');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);

    // Log request details
    if (error.config) {
      console.log('\nRequest details:');
      console.log('  URL:', error.config.url);
      console.log('  Method:', error.config.method);
      console.log('  Headers:', error.config.headers);
    }
    console.log('');
    return false;
  }
}

// Método 4: Verificar que la API key es correcta
async function verifyApiKey() {
  console.log('4️⃣  Verifying API key...\n');
  console.log('API Key from env:', RAPIDAPI_KEY);
  console.log('API Key length:', RAPIDAPI_KEY?.length);
  console.log('API Key matches curl?', RAPIDAPI_KEY === 'ce78ed8c6bmshaddfdc4d775937bp1e4a87jsnffa5db8695a5');
  console.log('');
}

async function main() {
  verifyApiKey();

  const results = {
    axiosMinimal: await testWithAxiosMinimal(),
    nodeHttps: await testWithNodeHttps(),
    axiosFull: await testWithAxiosFull()
  };

  console.log('='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log('Axios (minimal):', results.axiosMinimal ? '✅' : '❌');
  console.log('Node HTTPS:', results.nodeHttps ? '✅' : '❌');
  console.log('Axios (full):', results.axiosFull ? '✅' : '❌');
  console.log('');

  if (!results.axiosMinimal && !results.nodeHttps && !results.axiosFull) {
    console.log('⚠️  All Node.js methods failed but curl works!');
    console.log('');
    console.log('Possible causes:');
    console.log('  1. Node.js is adding extra headers that cause rejection');
    console.log('  2. SSL/TLS certificate issues');
    console.log('  3. IP-based rate limiting');
    console.log('  4. API key environment variable not loading correctly');
    console.log('');
    console.log('Recommendation:');
    console.log('  Try running: export RAPIDAPI_KEY="ce78ed8c6bmshaddfdc4d775937bp1e4a87jsnffa5db8695a5"');
    console.log('  Then run this script again');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
