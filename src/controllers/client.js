const axios = require('axios');
const BASE_URL = 'https://dhpstagingapi.health.go.ke/';
const { generateToken } = require('../utils/auth');
const { CHT } = require('../../config');
const { idMap, generateClientRegistryPayload } = require('../utils/client');

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const searchClientByIdType = async (echisClientDoc) => {
  try {
    const identificationType = getIdentificationType(echisClientDoc?.identifications?.identificationType);
    let clientNumber;
    const res = await axiosInstance.get(
      `partners/registry/search/${identificationType}/${echisClientDoc?.identifications?.identificationNumber}`
    );
    if (res.data.clientExists) {
      clientNumber = res.data.client.clientNumber;
    } else {
      const response = await createClientInRegistry(
        JSON.stringify(generateClientRegistryPayload(echisClientDoc))
      );
      clientNumber = response;
    }
    const echisDoc = await getEchisDocForUpdate(echisClientDoc._id);
    const echisResponse = await updateEchisDocWithUpi(clientNumber, echisDoc);
    return echisResponse;
  } catch (error) {
    return error;
  }
};

const getIdentificationType = (idType) => {
  if (idType in idMap) {
    return utils.idMap(idType);
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
        'Authorization'
      ] = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

const echisAxiosInstance = axios.create({
  baseURL: 'https://chis-staging.health.go.ke/',
  headers: {
    'Content-Type': 'application/json',
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
  echisDoc.upi = clientUpi;
  const response = await echisAxiosInstance.put(`medic/${docId}`, JSON.stringify(echisDoc));
  return response.data;
};

module.exports = {
  searchClientByIdType,
};