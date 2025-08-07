const {
  fetchCRClient,
  registerCRClient,
  generateEncryptedPin,
  updateCRClient,
} = require('./src/controllers/v3/client');
const { decryptCRClient } = require('./src/utils/decryptor');

async function testFetchCRClient(id) {
  try {
    console.log('Testing fetchCRClient...');
    const result = await fetchCRClient(id);
    return result;
  } catch (error) {
    console.error('fetchCRClient error:', error.message);
  }
}

function testGenerateEncryptedPin() {
  try {
    console.log('Testing generateEncryptedPin...');
    const encrypted = generateEncryptedPin('1234');
    return encrypted;
  } catch (error) {
    console.error('generateEncryptedPin error:', error.message);
  }
}

async function testRegisterCRClient() {
  try {
    console.log('Testing registerCRClient...');
    const result = await registerCRClient('1234');
    return result;
  } catch (error) {
    console.error('registerCRClient error:', error.message);
  }
}

async function testUpdateCRClient(data) {
  try {
    console.log('Testing updateCRClient...');
    const result = await updateCRClient(data);
    return result;
  } catch (error) {
    console.error('updateCRClient error:', error.message);
  }
}

async function lookUpOrCreateClient(id) {
    const client = await fetchCRClient(id);
    if (client) {
        console.log('Client found', JSON.stringify(client, null, 2));
        return client;
    }
    console.log('Client not found, registering...');
    const newClient = await registerCRClient(id);
    console.log('--------------------------------');
    console.log('New Client', JSON.stringify(newClient, null, 2));
    console.log('--------------------------------');
    return newClient;
}

async function updateClient(id) {
    const client = await fetchCRClient(id);
    if (client){
        const response = await updateCRClient({
            id: client.id,
            email: 'ebeiegiron@gmail.com',
            phone: '0712345678',
            encrypted_pin: generateEncryptedPin('1234'),
        })
        console.log('--------------------------------');
        console.log('Updated Client', JSON.stringify(response, null, 2));
        console.log('--------------------------------');

        const encodedClient = response.message.result[0]._pii;

        const decryptedClient = await decryptCRClient(encodedClient);
        console.log('--------------------------------');
        console.log('Decrypted Client', JSON.stringify(decryptedClient, null, 2));
        console.log('--------------------------------');
        return decryptedClient;
    }
    return null;
}

// updateCRClient({
//     id: '20202020',
//     email: 'ebeiegiron@gmail.com',
//     phone: '0712345678',
//     encrypted_pin: generateEncryptedPin('1234'),
// })

// lookUpOrCreateClient('20202020');

updateClient('20202020');