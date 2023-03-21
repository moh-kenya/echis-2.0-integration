const axios = require("axios");
const BASE_URL = "https://dhpstagingapi.health.go.ke/";
const qs = require("qs");
const utils = require("../utils/client");

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//illustration purposes
const getIdInfoFromEchisPayload = (echisDoc) => {
  return {
    identificationType: echisDoc.id_type || "alien-id",
    identificationNumber: echisDoc.id || "TESTZA12345",
  };
};

const searchClientByIdType = async (echisClientDoc) => {
  const idInformation = getIdInfoFromEchisPayload(echisClientDoc);
  const idType = idInformation.identificationType;
  const idNumber = idInformation.identificationNumber;
  const res = await axiosInstance.get(
    `partners/registry/search/${idType}/${idNumber}`
  );
  console.log(`${res.status}: ${res.statusText}`);
  return res.data.clientExists && res.data.client.clientNumber;
};

const createClientInRegistry = async (client) => {
  const res = await axiosInstance.post(
    `partners/registry`,
    JSON.stringify(client)
  );
  console.log(
    `${res.status}: ${res.statusText} - ${res.data.client.clientNumber}`
  );
  return res.data.client.clientNumber;
};

const samplePayload = {
  firstName: "Lindor",
  lastName: "Lindt",
  dateOfBirth: "2022-12-09",
  gender: "female",
  country: "KE",
  countyOfBirth: "042",
  residence: {
    county: "042",
    subCounty: "kisumu-central",
    village: "kondele",
  },
  identifications: [
    {
      countryCode: "KE",
      identificationType: "national-id",
      identificationNumber: "TESTKE12345",
    },
    {
      countryCode: "ZA",
      identificationType: "alien-id",
      identificationNumber: "TESTZA12345",
    },
  ],
  contact: {
    primaryPhone: "+254700111111",
  },
  nextOfKins: [
    {
      name: "Cresta Lindt",
      relationship: "sister",
      residence: "kondele",
      contact: {
        primaryPhone: "+254700334567",
      },
    },
  ],
};

const generateToken = async () => {
  const data = qs.stringify({
    client_id: "partner.test.client",
    client_secret: "partnerTestPwd",
    grant_type: "client_credentials",
    scope: "DHP.Gateway DHP.Partners",
  });

  const config = {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const res = await axios.post(
    "https://dhpidentitystagingapi.health.go.ke/connect/token",
    data,
    config
  );
  console.log(`${res.status}: ${res.statusText} `);
  return res.data.access_token;
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

const updateEchisClient = async (echisPatientDoc) => {
  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: "https://dhpstagingapi.health.go.ke/partners/registry/",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    let clientNumber = await searchClientByIdType(echisPatientDoc);
    if (!clientNumber) {
      clientNumber = await createClientInRegistry(samplePayload);
    }
    return clientNumber;
    //update doc in echis
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  updateEchisClient,
  searchClientByIdType,
};
