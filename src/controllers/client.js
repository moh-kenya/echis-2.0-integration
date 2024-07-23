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

const checkErr = (err, resp) => {
  let issues = resp.data.message?.issue || resp.data.issue;
  let errString = issues.map((issue) => issue.diagnostics).join(",");
  if (errString.includes("not found")) {
    throw new Error("no matches");
  }
  if (err) throw err;
};

const fetchClientFromRegistry = async (contact) => {
  const params = getIdentificationType(contact);
  let resp;
  try {
    resp = await axiosInstance.get("/api/v4/Patient", {
      params: { ...params },
    });
  } catch (err) {
    checkErr(err, err.response);
  }
  return resp.data.id || checkErr(resp);
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
