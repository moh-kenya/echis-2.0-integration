// Utility module for decrypting PII data using hybrid RSA-AES encryption
// Handles decryption of client data encrypted with RSA for key exchange and AES for data
const crypto = require('crypto');
const fs = require('fs');
const { HIE } = require("../../config");

/**
 * Decrypts PII data that was encrypted using hybrid RSA-AES encryption.
 * The combined base64 string contains: encrypted AES key, encrypted IV, and encrypted data.
 * @param {string} combinedBase64 - Base64 encoded string containing encrypted key:iv:data
 * @param {string} privateKeyPem - RSA private key in PEM format for decrypting AES key and IV
 * @returns {Object} - The decrypted JSON data
 * @throws {Error} - If decryption fails at any stage
 */
async function decryptPIIData(combinedBase64, privateKeyPem) {
  try {
    // Decode the combined base64 string
    const decodedStr = Buffer.from(combinedBase64, 'base64').toString();
    const [encryptedAesKey, encryptedIv, encryptedData] = decodedStr.split(':');

    // Decrypt AES key and IV using RSA
    const aesKey = decryptRSA(encryptedAesKey, privateKeyPem);
    const iv = decryptRSA(encryptedIv, privateKeyPem);

    // Decrypt the actual data using AES
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    
    // Create decipher with AES-CBC
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedDataBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Convert to string and parse JSON
    const jsonString = decrypted.toString();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}

/**
 * Decrypts RSA-encrypted AES keys and initialization vectors.
 * Uses OAEP padding with SHA-1 hash for secure RSA decryption.
 * @param {string} encryptedBase64 - Base64 encoded RSA-encrypted data (AES key or IV)
 * @param {string} privateKeyPem - RSA private key in PEM format
 * @returns {Buffer} - Decrypted AES key or IV as a Buffer
 */
function decryptRSA(encryptedBase64, privateKeyPem) {
  const encryptedData = Buffer.from(encryptedBase64, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha1'
    },
    encryptedData
  );
  
  // Convert decrypted string back to Buffer - the AES key/IV was base64 encoded before RSA encryption
  return Buffer.from(decrypted.toString(), 'base64');
}

/**
 * Utility function to save decrypted JSON data to a file.
 * Primarily used for debugging and data inspection purposes.
 * @param {Object} data - The JSON data to save
 * @param {string} filename - Output filename (defaults to "decrypted_data.json")
 */
function saveJsonToFile(data, filename = "decrypted_data.json") {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 4), 'utf8');
    console.log(`JSON data successfully saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving to file: ${error}`);
  }
}

/**
 * Main function to decrypt client referral (CR) data using the configured HIE private key.
 * This is the primary entry point for decrypting PII data from external systems.
 * @param {string} combinedBase64 - Base64 encoded encrypted client data
 * @returns {Object} - Decrypted client data as JSON object
 * @throws {Error} - If decryption fails or HIE private key is not configured
 */
async function decryptCRClient(combinedBase64) {
  // Use the configured HIE private key from application config
  const privateKeyPem = HIE.privateKey;

  try {
    // Decrypt the data
    const decryptedData = await decryptPIIData(combinedBase64, privateKeyPem);
    return decryptedData;   
  } catch (error) {
    console.error("Main execution failed:", error);
  }
}

module.exports = {
  decryptCRClient
}
