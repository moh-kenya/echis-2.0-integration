const { decryptCRClient } = require('../../utils/decryptor');
const { HIE } = require("../../../config");
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

const fetchCRClient = async (nationalID) => {
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
      console.log("Fetch client response", JSON.stringify(resp.data, null, 2));

      if (resp.data.total <= 0) {
        throw new Error('client not found');
      }
      const encodedClient = resp.data.message.result[0]._pii;

      const client = await decryptCRClient(encodedClient);
      
      if(client.length === 0) {
        throw new Error('Error decrypting client data');
      }

      return (
        {
          id: client.id,
          name: client.first_name + ' ' + client.last_name,
          date_of_birth: client.date_of_birth,
          sex: client.gender,
          household_number: client.other_identifications[1].identification_number ?? null,
        } ?? err(resp)
      );
    } catch (error) {
      err(error.response, error);
    }
  };

const registerCRClient = async (idNumber) => {
  try {
    const reqBody = {
        "identification_type": "NATIONAL ID",
        "identification_number": idNumber,
        "agent": HIE.agent,
        "encrypted_pin": generateEncryptedPin(1234),
    }
    const resp = await authenticatedInstance.instance().post('/v3/uat-cr-registration', reqBody);
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
      
      // Convert PIN to buffer
      const pinBuffer = Buffer.from(pinString, 'utf8');
      
      // Encrypt using RSA public key
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKeyPem,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha1'
        },
        pinBuffer
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
};