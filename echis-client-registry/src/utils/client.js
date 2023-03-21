const getIdInfoFromEchisPayload = async (echisDoc) => {
    return {
      identificationType: 'alien-id',
      identificationNumber: 'TESTZA12345'
    }
  };

const generateEchisUpdatePayload = async (echisDoc, clientNumber) => {
    return JSON.stringify({
        _id: echisDoc._id,
        _rev: echisDoc._rev,
        upi: clientNumber
    });
}

const generateClientRegistryPayload = async (echisDoc) => {

}

module.exports = {
    getIdInfoFromEchisPayload,
    generateEchisUpdatePayload,
    generateClientRegistryPayload
}