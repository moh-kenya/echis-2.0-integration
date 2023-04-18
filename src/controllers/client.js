const axios = require("axios");
const { generateToken } = require("../utils/auth");
const { CHT, CLIENT_REGISTRY } = require("../../config");
const { idMap, generateClientRegistryPayload } = require("../utils/client");
const { logger } = require("../utils/logger");

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  headers: {
    "Content-Type": "application/json",
  },
});

const searchClientByIdType = async (echisClientDoc) => {
  try {
    const identificationType = getIdentificationType(echisClientDoc?.doc.identification_type);

    let clientNumber;

    logger.information("Echis Document:");
    logger.information(JSON.stringify(echisClientDoc));
    logger.information("Calling client registry");
    
    const res = await axiosInstance.get(`partners/registry/search/${identificationType}/${echisClientDoc?.doc.identification_number}`);
    
    if (res.data.clientExists) {
      logger.information("Client found");
      clientNumber = res.data.client.clientNumber;
    } 
    else {
      logger.information("Client not found");
      logger.information("Creating client in client registry");
      const response = await createClientInRegistry(JSON.stringify(generateClientRegistryPayload(echisClientDoc)));

      clientNumber = response;
    }

    const echisDoc = await getEchisDocForUpdate(echisClientDoc.doc._id);
    const echisResponse = await updateEchisDocWithUpi(clientNumber, echisDoc);

    return echisResponse;
  } 
  catch (error) {
    if (error.response.status === 404) {
      let clientNumber;
      logger.information("Client not found");
      logger.information("Creating client in client registry");
      const response = await createClientInRegistry(
        JSON.stringify(generateClientRegistryPayload(echisClientDoc))
      );
      clientNumber = response;
      const echisDoc = await getEchisDocForUpdate(echisClientDoc.doc._id);
      const echisResponse = await updateEchisDocWithUpi(clientNumber, echisDoc);
      return echisResponse;
    } else {
      logger.error(error);
      return error;
    }
  }
};

const getIdentificationType = (idType) => {
  if (idType in idMap) {
    return idMap[idType];
  }
  return idType;
};

const createClientInRegistry = async (client) => {
  const res = await axiosInstance.post(`partners/registry`, client);
  return res.data.clientNumber;
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const token = await generateToken();
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

const echisAxiosInstance = axios.create({
  baseURL: CHT.url,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: CHT.username,
    password: CHT.password,
  },
});

const getEchisDocForUpdate = async (docId) => {
  const response = await echisAxiosInstance.get(`medic/${docId}`);
  return response.data;
};

const updateEchisDocWithUpi = async (clientUpi, echisDoc) => {
  logger.information("Updating eCHIS document with client registry UPI");
  echisDoc.upi = clientUpi;
  const response = await echisAxiosInstance.put(
    `medic/${echisDoc._id}`,
    JSON.stringify(echisDoc)
  );
  return response.data;
};

module.exports = {
  searchClientByIdType,
  createClientInRegistry,
  getEchisDocForUpdate,
  updateEchisDocWithUpi,
  generateClientRegistryPayload
};
