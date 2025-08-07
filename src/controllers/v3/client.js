const { decryptCRClient } = require('../../utils/decryptor');
const { HIE } = require('../../../config');
const { AuthenticatedInstance } = require('./auth');
const crypto = require('crypto');

const authenticatedInstance = new AuthenticatedInstance();

const err = (resp, err) => {
  if (err) throw err;
  let issues = resp.data.message?.issue || resp.data.issue;
  let errString = issues.map((issue) => issue.diagnostics).join(',');
  if (errString.includes('not found')) {
    throw new Error('no matches');
  } else {
    throw new Error(errString);
  }
};

/**
 * Fetches a client from the CR
 * @param {string} nationalID - National ID number
 * @returns {Object} - CR Client data
 */
const fetchCRClient = async (nationalID) => {
  if (!nationalID) {
    throw new Error('Valid national ID is required');
  }

  try {
    const resp = await authenticatedInstance
      .instance()
      .get('v3/client-registry/fetch-client', {
        params: {
          identification_type: 'NATIONAL ID',
          identification_number: nationalID,
          agent: HIE.agent,
        },
      });

    if (resp.data.message.total === 0) {
      return null;
    }

    const encodedClient = resp.data.message.result[0]._pii;

    const client = await decryptCRClient(encodedClient);

    if (client.length === 0) {
      throw new Error('Error decrypting client data');
    }

    return {
      id: client.id,
      name: client.first_name + ' ' + client.last_name,
      date_of_birth: client.date_of_birth,
      sex: client.gender,
      household_number:
        client.other_identifications?.[1]?.identification_number ?? null,
    };
  } catch (error) {
    err(error.response, error);
  }
};

/**
 * Registers a new client in the CR
 * @param {string} idNumber - National ID number
 * @returns {Object} - CR Client data
 */
const registerCRClient = async (idNumber) => {
  try {
    const reqBody = {
      identification_type: 'NATIONAL ID',
      identification_number: idNumber,
      agent: HIE.agent,
      encrypted_pin: generateEncryptedPin(HIE.defaultPin),
    };
    const resp = await authenticatedInstance
      .instance()
      .post('/register-cr-client', reqBody);
    return resp.data;
  } catch (error) {
    err(error.response, error);
  }
};

/**
 * Updates a client in the CR
 * @param {Object} data - CR Id, PIN and the data to update (email, phone, )
 * @returns {Object} - CR Client data
 */
const updateCRClient = async (data) => {
  try {
    const reqBody = {
      agent: HIE.agent,
      ...data,
    };
    const resp = await authenticatedInstance
      .instance()
      .put('/v3/update-client', reqBody);
    return resp.data;
  } catch (error) {
    err(error.response, error);
  }
};

/**
 * Encrypts a 4-digit PIN using RSA public key encryption and returns Base64 encoded result
 * @param {string|number} pin - The 4-digit numerical PIN
 * @returns {string} - RSA encrypted and Base64 encoded PIN
 * @throws {Error} - If PIN is not exactly 4 digits or encryption fails
 */
function generateEncryptedPin(pin) {
  try {
    // Convert to string if it's a number
    const pinString = pin.toString();

    // Validate that it's exactly 4 digits
    if (!/^\d{4}$/.test(pinString)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    // Get the public key from environment
    const publicKeyPem = HIE.publicKey;
    if (!publicKeyPem) {
      throw new Error('HIE public key not configured');
    }

    if (!publicKeyPem.includes('-----BEGIN PUBLIC KEY-----')) {
      throw new Error('Invalid public key format. Expected PEM format.');
    }

    // Convert PIN to buffer
    const pinBuffer = Buffer.from(pinString, 'utf8');

    // Encrypt using RSA public key
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha1',
      },
      pinBuffer,
    );

    // Convert to Base64
    return encrypted.toString('base64');
  } catch (error) {
    console.error('PIN encryption failed:', error);
    throw new Error(`Failed to encrypt PIN: ${error.message}`);
  }
}

module.exports = {
  fetchCRClient,
  registerCRClient,
  generateEncryptedPin,
  updateCRClient,
};
