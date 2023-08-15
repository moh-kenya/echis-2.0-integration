const axios = require("axios");
const { generateToken } = require("../utils/auth");
const { CHT, CLIENT_REGISTRY } = require("../../config");
const { idMap, generateClientRegistryPayload } = require("../utils/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const {
  ECHIS_DOCUMENT,
  CALL_CR,
  CLIENT_FOUND,
  CLIENT_NOT_FOUND,
  CREATE_IN_CR,
  GEN_CR_FAILURE,
  GET_CL_CR_FAILURE,
  UPDATE_ECHIS_DOC_FAILED,
  GET_ECHIS_DOC_FAILED,
  AXIOS_POST_CR_FAILED,
  GEN_TOKEN_FAILURE,
  AXIOS_GET_DOC_FAILURE,
  AXIOS_PUT_UPI_FAILURE,
  CLIENT_UPDATE,
} = messages;

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  headers: {
    "Content-Type": "application/json",
  },
});

const clientFactory = async (echisClientDoc) => {
  try {
    const identificationType = getIdentificationType(
      echisClientDoc?.doc.identification_type
    );

    logger.information(ECHIS_DOCUMENT);
    logger.information(JSON.stringify(echisClientDoc));
    logger.information(CALL_CR);

    axiosInstance
      .get(
        `partners/registry/search/${identificationType}/${echisClientDoc?.doc.identification_number}`
      )
      .then((res) => {
        if (res.data.clientExists) {
          logger.information(CLIENT_FOUND);
          return updateDocWithUPI(echisClientDoc, res.data.client.clientNumber);
        } else {
          logger.information(CLIENT_NOT_FOUND);
          logger.information(CREATE_IN_CR);
          createClientInRegistry(
            JSON.stringify(generateClientRegistryPayload(echisClientDoc))
          )
            .then((response) => {
              return updateDocWithUPI(echisClientDoc, response);
            })
            .catch((error) => {
              logger.error(GEN_CR_FAILURE);
            });
        }
      })
      .catch((error) => {
        logger.error(GET_CL_CR_FAILURE);
      });
  } catch (error) {
    if (error?.response?.status === 404) {
      let clientNumber;
      logger.information(CLIENT_NOT_FOUND);
      logger.information(CREATE_IN_CR);
      createClientInRegistry(
        JSON.stringify(generateClientRegistryPayload(echisClientDoc))
      )
        .then((response) => {
          clientNumber = response;
          return updateDocWithUPI(echisClientDoc, clientNumber);
        })
        .catch((error) => {
          logger.error(GEN_CR_FAILURE);
        });
    } else {
      logger.error(error);
      return error;
    }
  }
};
const updateDocWithUPI = (echisClientDoc, clientNumber) => {
  getEchisDocForUpdate(echisClientDoc.doc._id)
    .then((echisDoc) => {
      updateEchisDocWithUpi(clientNumber, echisDoc)
        .then((echisResponse) => {
          logger.information(
            `${CLIENT_UPDATE} ${JSON.stringify(echisResponse)}`
          );
          return echisResponse;
        })
        .catch((error) => {
          logger.error(UPDATE_ECHIS_DOC_FAILED);
        });
    })
    .catch((error) => {
      logger.error(GET_ECHIS_DOC_FAILED);
    });
};

const getIdentificationType = (idType) => {
  if (idType in idMap) {
    return idMap[idType];
  }
  return idType;
};

const createClientInRegistry = async (client) => {
  try {
    const res = await axiosInstance.post(`partners/registry`, client);
    return res.data.clientNumber;
  } catch (error) {
    logger.error(AXIOS_POST_CR_FAILED);
  }
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = await generateToken();
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        logger.error(GEN_TOKEN_FAILURE);
      }
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
  try {
    const response = await echisAxiosInstance.get(`medic/${docId}`);
    return response.data;
  } catch (error) {
    logger.error(AXIOS_GET_DOC_FAILURE);
  }
};

const updateEchisDocWithUpi = async (clientUpi, echisDoc) => {
  logger.information(UPDATE_ECHIS_WITH_UPI);
  echisDoc.upi = clientUpi;
  try {
    const response = await echisAxiosInstance.put(
      `medic/${echisDoc._id}`,
      JSON.stringify(echisDoc)
    );
    return response.data;
  } catch (error) {
    logger.error(AXIOS_PUT_UPI_FAILURE);
  }
};

module.exports = {
  clientFactory,
  createClientInRegistry,
  getEchisDocForUpdate,
  updateEchisDocWithUpi,
  generateClientRegistryPayload,
};
