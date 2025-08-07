const {
  fetchCRClient,
  registerCRClient,
  generateEncryptedPin,
  updateCRClient,
} = require('./src/controllers/v3/client');

async function testFetchCRClient() {
  try {
    console.log('Testing fetchCRClient...');
    const result = await fetchCRClient('10101010');
    console.log('--------------------------------');
    console.log('CR Client Data', JSON.stringify(result, null, 2));
    console.log('--------------------------------');
  } catch (error) {
    console.error('fetchCRClient error:', error.message);
  }
}

function testGenerateEncryptedPin() {
  try {
    console.log('Testing generateEncryptedPin...');
    const encrypted = generateEncryptedPin('1234');
    console.log('--------------------------------');
    console.log('Encrypted PIN', encrypted);
    console.log('--------------------------------');
  } catch (error) {
    console.error('generateEncryptedPin error:', error.message);
  }
}

async function testRegisterCRClient() {
  try {
    console.log('Testing registerCRClient...');
    const result = await registerCRClient('1234');
    console.log('--------------------------------');
    console.log('Registered CR Client', JSON.stringify(result, null, 2));
    console.log('--------------------------------');
  } catch (error) {
    console.error('registerCRClient error:', error.message);
  }
}

async function testUpdateCRClient(data) {
  try {
    console.log('Testing updateCRClient...');
    const result = await updateCRClient(data);
    console.log('--------------------------------');
    console.log('Updated CR Client', JSON.stringify(result, null, 2));
    console.log('--------------------------------');
  } catch (error) {
    console.error('updateCRClient error:', error.message);
  }
}

// async function runTests() {
//   await testFetchCRClient();
//   testGenerateEncryptedPin();
//   await testRegisterCRClient();
// }

// runTests();
async function testClientUpdate() {
  const client = await registerCRClient('90909090');
  console.log('--------------------------------');
  console.log('Client Data', JSON.stringify(client, null, 2));
  console.log('--------------------------------');
  const result = await updateCRClient({
    id: client.id,
    email: 'test@test.com',
    phone: '0712345678',
    encrypted_pin: generateEncryptedPin('1234'),
  });
  console.log('--------------------------------');
  console.log('Updated CR Client', JSON.stringify(result, null, 2));
  console.log('--------------------------------');
}

testClientUpdate();
