const axios = require("axios");
const { generateToken } = require("../utils/auth");
const { getCHTValuesFromEnv, CLIENT_REGISTRY } = require("../../config");
const {
  generateClientRegistryPayload,
  getMismatchedClientFields,
} = require("../utils/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { updateDoc, createReport } = require("../utils/echis");
const { CLIENT_DETAILS_MISMATCH, GEN_TOKEN_FAILURE } = messages;

const tryClientRegistryReauth = async (error) => {
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }

  const originalRequest = error.config;
  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  logger.information("Re-authenticating with Client Registry");
  try {
    originalRequest._retry = true;
    const token = await generateToken();
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return axiosInstance(originalRequest);
  } catch (err) {
    logger.error(
      `${GEN_TOKEN_FAILURE} ${err.response.status} ${err.response.body}`
    );
  }

  return Promise.reject(error);
};

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.response.use(
  (response) => response,
  tryClientRegistryReauth
);

// Create client in the Client Registry and update an echis instance with the client number
const createCRClient = (conf, echisClient) => {
  const payload = generateClientRegistryPayload(echisClient);
  return axiosInstance
    .post(`partners/registry`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((resp) => {
      return updateDoc(conf, echisClient._id, {
        upi: resp.data.clientNumber,
      }).then(() => Promise.resolve(resp.data.clientNumber));
    });
};

const createClientDetailsMismatchReport = (conf, echisClientId, fields) => {
  const report = {
    _meta: {
      form: "CLIENT_DETAILS_MISMATCH",
    },
    patient_id: echisClientId,
    mismatched_fields: fields.join(" "),
    source: "Client Registry",
  };
  return createReport(conf, report);
};

async function assignEchisClientUPI(req, res) {
  const success = (code, echisClientId, clientNumber) => {
    res.status(code).send({
      data: {
        echis_doc: echisClientId,
        upi: clientNumber,
      },
    });
  };
  const instance = res.locals.instanceValue;
  const chtInstanceVariables = getCHTValuesFromEnv(instance);
  const instanceObject = {
    instance: chtInstanceVariables.url,
    user: chtInstanceVariables.username,
    password: chtInstanceVariables.password,
  };
  // if they already exist in CR we check if the fields provided match what is in the CR and if they do, update echis with UPI.
  if (res.locals.crClientExists) {
    const mismatchedFields = getMismatchedClientFields(
      res.locals.echisClient,
      res.locals.crClient
    );
    // if fields do not match, create report on echis for follow up and return error
    if (Object.keys(mismatchedFields).length > 0) {
      try {
        await createClientDetailsMismatchReport(
          instanceObject,
          res.locals.echisClient._id,
          Object.keys(mismatchedFields)
        );
        res.status(200).send({
          data: {
            msg: CLIENT_DETAILS_MISMATCH,
            fields: mismatchedFields,
          },
        });
      } catch (err) {
        const errString = `could not create details mismatch report on ${
          getCHTValuesFromEnv(instance).url
        }: ${err.message}`;
        logger.error(errString);
        res.status(400).send({ error: errString });
      }
    } else {
      // else update contact doc with UPI
      try {
        await updateDoc(instanceObject, res.locals.echisClient._id, {
          upi: res.locals.crClient.clientNumber,
        });
        success(
          200,
          res.locals.echisClient._id,
          res.locals.crClient.clientNumber
        );
      } catch (err) {
        const errString = `could not update doc ${
          res.locals.echisClient._id
        } on ${getCHTValuesFromEnv(instance).url}: ${err.message}`;
        logger.error(errString);
        res.status(400).send({ error: errString });
      }
    }
    return; // nothing more to do here
  }
  // echis client did not exist in the registry, lets create them
  try {
    const clientNumber = await createCRClient(
      instanceObject,
      res.locals.echisClient
    );
    success(201, res.locals.echisClient._id, clientNumber);
  } catch (err) {
    const errStruct = {
      instance: getCHTValuesFromEnv(instance).url,
      user: res.locals.echisClient._id,
      error:
        err?.response?.data?.errors ||
        err?.message ||
        "Could not create Client in CR",
    };
    const errString = `could not complete creating client ${JSON.stringify(
      errStruct
    )})`;
    logger.error(errString);
    res.status(400).send({ error: errString });
  }
}

module.exports = {
  assignEchisClientUPI,
  crAxiosInstance: axiosInstance,
  createCRClient,
};
