const axios = require("axios");
const { generateToken } = require("../utils/auth");
const { CHT, CLIENT_REGISTRY } = require("../../config");
const { idMap, generateClientRegistryPayload, getPropByString } = require("../utils/client");
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
    // if doc has upi return early
    if (echisClientDoc?.doc?.upi) {
      return {
        upi: echisClientDoc?.doc.upi,
      };
    }
    logger.information(ECHIS_DOCUMENT);
    logger.information(JSON.stringify(echisClientDoc));
    logger.information(CALL_CR);
    // get their ID so we can check if they exist
    const identificationType = getIdentificationType(echisClientDoc?.doc.identification_type);
    const response = await axiosInstance.get(
      `partners/registry/search/${identificationType}/${echisClientDoc?.doc.identification_number}`
    );
    // if they already exist in CR we check if the fields provided match what is in the CR and if they do, update echis with UPI.
    if (response.data.clientExists) {
      logger.information(CLIENT_FOUND);
      const mismatchedFields = getMismatchedClientFields(echisClientDoc, response.data.client);
      // if fields do not match, create report on echis for follow up and return error
      if (mismatchedFields.length > 0) {
        await createClientDetailsMismatchReport(echisClientDoc, mismatchedFields);
        return {
          error: "client fields mismatch",
          fields: mismatchedFields
        }
      }
      // update contact doc with UPI and return UPI
      await updateDocWithUPI(echisClientDoc, response.data.client.clientNumber);
      return {
        upi: response.data.client.clientNumber,
      };
    }
    // if we get here, they did not exist in CR, we create them and update echis with the UPI
    logger.information(CLIENT_NOT_FOUND);
    logger.information(CREATE_IN_CR);
    const createResponse = await createClientInRegistry(JSON.stringify(generateClientRegistryPayload(echisClientDoc)));
    await updateDocWithUPI(echisClientDoc, createResponse);
    return createResponse;
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
const createClientDetailsMismatchReport = async (echisClientDoc, fields) => {
  try {
    logger.information("Creating details mismatch report in echis");
    const axiosInstance = axios.create({
      baseURL: CHT.url,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: CHT.username,
        password: CHT.password,
      },
    });
    const body = {
      _meta: {
        form: "client_details_mismatch",
      },
      patient_id: echisClientDoc.doc._id,
      authored_on: echisClientDoc.doc.reported_date,
      mismatched_fields: fields,
      source: `Client Registry`,
    };
    const response = await axiosInstance.post(`api/v2/records`, body);
    logger.information(COMPLETED_SUCCESSFULLY);
    return response;

  } catch (error) {
    logger.error(error);
    return error;
  }
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

// compare fields in the echis client doc and the client doc we got from Client Registry
function getMismatchedClientFields(echisClientDoc, crClientDoc) {
  // fields that ideally should be kind of unique across clients
  const matcherFields = ["firstName", "middleName", "lastName", "gender", "dateOfBirth", "contact.primaryPhone"];
  // where we store our mismatched fields and return them later
  const mismatchedFields = [];
  // the payload we generate here has the same format as what we get back when we query for client existence
  const crPayload = generateClientRegistryPayload(echisClientDoc);
  matcherFields.forEach(key => {
    if (getPropByString(crClientDoc, key) !== getPropByString(crPayload, key)) {
      mismatchedFields.push(key);
    }
  });
  return mismatchedFields;
}

module.exports = {
  clientFactory,
  createClientInRegistry,
  getEchisDocForUpdate,
  updateEchisDocWithUpi,
  generateClientRegistryPayload,
};
