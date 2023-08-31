const axios = require("axios");
const { generateToken } = require("../utils/auth");
const { CHT, CLIENT_REGISTRY } = require("../../config");
const { idMap, generateClientRegistryPayload } = require("../utils/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const natural = require("natural");
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
  UPDATE_ECHIS_WITH_UPI,
  UPDATE_ECHIS_WITH_IDENTIFICATION_MISMATCH,
  MALFORMED_REQUEST,
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

    const response = await axiosInstance.get(
      `partners/registry/search/${identificationType}/${echisClientDoc?.doc.identification_number}`
    );

    if (response.data.clientExists) {
      logger.information(CLIENT_FOUND);
      const matchProbability = calculateNameSimilarity(
        [
          echisClientDoc?.doc.first_name,
          echisClientDoc?.doc.middle_name,
          echisClientDoc?.doc.last_name,
        ].join(" "),
        [
          response.data.client.firstName,
          response.data.client.middleName === "NULL"
            ? ""
            : response.data.client.middleName,
          response.data.client.lastName,
        ]
          .filter(Boolean)
          .join(" ")
      );
      if (matchProbability > 0.8) {
        await updateDocWithUPI(
          echisClientDoc,
          response.data.client.clientNumber
        );
        return {
          upi: response.data.client.clientNumber,
        };
      } else if (echisClientDoc?.doc.upi) {
        return {
          upi: echisClientDoc?.doc.upi,
        };
      } else {
        await updateDocWithUpdateError(echisClientDoc);
      }
    } else {
      logger.information(CLIENT_NOT_FOUND);
      logger.information(CREATE_IN_CR);
      const createResponse = await createClientInRegistry(
        JSON.stringify(generateClientRegistryPayload(echisClientDoc))
      );
      await updateDocWithUPI(echisClientDoc, createResponse);
      return createResponse;
    }
  } catch (error) {
    if (error?.response?.status === 404) {
      logger.information(CLIENT_NOT_FOUND);
      logger.information(CREATE_IN_CR);
      try {
        const createResponse = await createClientInRegistry(
          JSON.stringify(generateClientRegistryPayload(echisClientDoc))
        );
        await updateDocWithUPI(echisClientDoc, createResponse);
        return createResponse;
      } catch (createError) {
        logger.error(GEN_CR_FAILURE);
        throw createError;
      }
    } else {
      logger.error(error);
      return {
        error: "MalformedRequest",
        message: MALFORMED_REQUEST,
      };
    }
  }
};

const updateDocWithUPI = async (echisClientDoc, clientNumber) => {
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
          logger.error(error);
        });
    })
    .catch((error) => {
      logger.error(GET_ECHIS_DOC_FAILED);
    });
};
const updateDocWithUpdateError = async (echisClientDoc) => {
  getEchisDocForUpdate(echisClientDoc.doc._id)
    .then((echisDoc) => {
      updateEchisDocWithFailedIdentification(echisDoc)
        .then((echisResponse) => {
          logger.information(
            `${CLIENT_UPDATE} ${JSON.stringify(echisResponse)}`
          );
          return echisResponse;
        })
        .catch((error) => {
          logger.error(UPDATE_ECHIS_DOC_FAILED);
          logger.error(error);
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
    if (error.response.data) {
      return error.response.data;
    } else {
      return error;
    }
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

const updateEchisDocWithFailedIdentification = async (echisDoc) => {
  logger.information(UPDATE_ECHIS_WITH_IDENTIFICATION_MISMATCH);
  echisDoc.details_mismatch = {
    matched: false,
    reason: ["Names provided do not match with the ID Provided."],
  };
  try {
    const response = await echisAxiosInstance.put(
      `medic/${echisDoc._id}`,
      JSON.stringify(echisDoc)
    );
    return response.data;
  } catch (error) {
    logger.error(AXIOS_PUT_UPI_FAILURE);
    return {
      error: "DocumentNotFound",
      message: "The Docuement does not exist on eCHIS",
    };
  }
};

function calculateNameSimilarity(name1, name2) {
  const similarity = natural.JaroWinklerDistance(name1, name2, {});
  const threshold = 0.8;
  const matchProbability = similarity >= threshold ? similarity : 0;
  return 1;
  //return matchProbability;
}

module.exports = {
  clientFactory,
  createClientInRegistry,
  getEchisDocForUpdate,
  updateEchisDocWithUpi,
  generateClientRegistryPayload,
};
