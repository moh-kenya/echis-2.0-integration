const axios = require("axios");
const { CLIENT_REGISTRY } = require("../../config");
const { getIdentificationType } = require("../utils/client");
const echis = require("../utils/echis");

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  auth: {
    username: CLIENT_REGISTRY.user,
    password: CLIENT_REGISTRY.pass,
  },
});

const fetchClientFromRegistry = async (contact) => {
  const params = getIdentificationType(contact);
  const resp = await axiosInstance.get("/client-registry/fetch-client", {
    params: {
      payload: JSON.stringify(params),
    },
  });
  if (resp.status !== 200 || resp.data.message.total <= 0) {
    throw new Error(
      `status: ${resp.status} | matches: ${JSON.stringify(resp.data.message)}`
    );
  }
  if (resp.data.message.total > 1) {
    throw new Error("multiple matches for id");
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
