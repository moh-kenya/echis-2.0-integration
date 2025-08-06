const { fetchCRClient, registerCRClient, generateEncryptedPin } = require('./src/controllers/v3/client');

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
    
async function runTests() {
    await testFetchCRClient();
    testGenerateEncryptedPin();
    await testRegisterCRClient();
}

runTests();