// Import required Node.js modules
const crypto = require('crypto');
const fs = require('fs');

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
  
  // The key difference: return the decrypted data as a Buffer, 
  // then decode it as base64 to get the actual AES key/IV
  return Buffer.from(decrypted.toString(), 'base64');
}

function saveJsonToFile(data, filename = "decrypted_data.json") {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 4), 'utf8');
    console.log(`JSON data successfully saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving to file: ${error}`);
  }
}

// Main execution
async function main() {
  // Combined base64 string from encryption (use your actual combined base64 string)
  const combinedBase64 = "";
  
  // Your RSA private key (use your actual private key)
  const privateKeyPem = `-----BEGIN PRIVATE KEY-----
-----END PRIVATE KEY-----`;

  try {
    // Decrypt the data
    const decryptedData = await decryptPIIData(combinedBase64, privateKeyPem);
    
    // Output the decrypted JSON data
    console.log("Decrypted JSON Data:", JSON.stringify(decryptedData, null, 2));
    
    // Save to file
    saveJsonToFile(decryptedData);
  } catch (error) {
    console.error("Main execution failed:", error);
  }
}

// Run the main function
if (require.main === module) {
  main();
}
