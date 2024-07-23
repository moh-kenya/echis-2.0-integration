const axios = require("axios");
const { CLIENT_REGISTRY } = require("../../../config");
const { supportedIDTypes } = require("../../utils/client");
const echis = require("../../utils/echis");
const { logger } = require("../../utils/logger");

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  auth: {
    username: CLIENT_REGISTRY.user,
    password: CLIENT_REGISTRY.pass,
  },
});

const checkErr = (resp, err) => {
  let issues = resp.data.message?.issue || resp.data.issue;
  let errString = issues.map((issue) => issue.diagnostics).join(",");
  if (errString.includes("not found")) {
    throw new Error("no matches");
  }
  if (err) throw err;
};

const parseID = (contact) => {
  const idType = contact.identification_type;
  if (idType in supportedIDTypes) {
    return {
      [supportedIDTypes[idType]]: contact.identification_number,
    };
  }
  return null;
};

const fetchClientFromRegistry = async (contact) => {
  const params = parseID(contact);
  let resp;
  try {
    resp = await axiosInstance.get("/api/v4/Patient", {
      params: { ...params },
    });
  } catch (err) {
    checkErr(err.response, err);
  }
  return resp.data.id || checkErr(resp);
};

const getCRFields = async (contact) => {
  try {
    return {
      client_registry: {
        id: await fetchClientFromRegistry(contact),
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

const updateContactCRID = async (instance, contact) => {
  let fields = await getCRFields(contact);
  await echis.updateDoc(echis.getInstanceConf(instance), contact._id, fields);
  return fields;
};

const contactHandler = async (_, response) => {
  const contact = response.locals.contact;
  if (contact.client_registry?.status === "OK") {
    return;
  }
  await updateContactCRID(response.locals.instanceValue, contact);
};

module.exports = {
  fetchClientFromRegistry,
  updateContactCRID,
  getCRFields,
  contactHandler,
};
