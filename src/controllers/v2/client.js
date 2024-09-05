const axios = require("axios");
const { CLIENT_REGISTRY } = require("../../../config");
const { supportedIDTypes } = require("../../utils/client");
const { logger } = require("../../utils/logger");

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  auth: {
    username: CLIENT_REGISTRY.user,
    password: CLIENT_REGISTRY.pass,
  },
  timeout: 10000,
});

const err = (resp, err) => {
  if (err) throw err;
  let issues = resp.data.message?.issue || resp.data.issue;
  let errString = issues.map((issue) => issue.diagnostics).join(",");
  if (errString.includes("not found")) {
    throw new Error("no matches");
  } else {
    throw new Error(errString);
  }
};

const parseID = (contact) => {
  const idType = contact.identification_type;
  if (idType in supportedIDTypes) {
    return {
      [supportedIDTypes[idType]]: contact.identification_number,
    };
  }
  throw new Error(
    "Invalid identification type: " + contact.identification_type
  );
};

const fetchClientFromRegistry = async (contact) => {
  const params = parseID(contact);
  try {
    const resp = await axiosInstance.get("/api/v4/Patient", {
      params: { ...params },
    });
    return resp.data.id ?? err(resp);
  } catch (err) {
    err(err.response, err);
  }
};

const getCRFields = async (contact) => {
  try {
    const id = await fetchClientFromRegistry(contact);
    return {
      client_registry: {
        id,
        status: "OK",
      },
    };
  } catch (error) {
    logger.error(error.message);
    return {
      client_registry: {
        error: error.message,
      },
    };
  }
};

module.exports = {
  fetchClientFromRegistry,
  getCRFields,
};
