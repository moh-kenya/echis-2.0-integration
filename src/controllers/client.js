const axios = require("axios");
const { TIBERBU_SERVICE } = require("../../config");
const { getIdentificationType } = require("../utils/client");
const echis = require("../utils/echis");
const { logger } = require("../utils/logger");

const axiosInstance = axios.create({
  baseURL: TIBERBU_SERVICE.url,
  auth: {
    username: TIBERBU_SERVICE.user,
    password: TIBERBU_SERVICE.pass,
  },
});

const fetchClientFromRegistry = async (contact) => {
  const params = getIdentificationType(contact);
  const resp = await axiosInstance.get("/client-registry/fetch-client", {
    params: {
      payload: JSON.stringify(params),
    },
  });
  if (resp.data.message.total <= 0) {
    throw new Error("no matches");
  }
  if (resp.data.message.total > 1) {
    logger.error(`multiple CR matches for ${params}`);
    throw new Error(`multiple matches`);
  }
  return resp.data.message.result[0].id;
};

const updateContactCRID = async (instance, contact) => {
  let id = await fetchClientFromRegistry(contact);
  await echis.updateDoc(echis.getInstanceConf(instance), contact._id, {
    client_registry: {
      id,
      status: "OK",
    },
  });
  return id;
};

const contactHandler = async (_, response) => {
  const contact = response.locals.contact;
  if (contact.client_registry?.status === "OK") {
    return;
  }
  try {
    await updateContactCRID(response.locals.instanceValue, contact);
  } catch (error) {
    await echis.updateDoc(
      echis.getInstanceConf(response.locals.instanceValue),
      contact._id,
      {
        client_registry: {
          error: error.message,
        },
      }
    );
  }
};

module.exports = {
  fetchClientFromRegistry,
  updateContactCRID,
  contactHandler,
};
