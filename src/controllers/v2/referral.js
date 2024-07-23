const axios = require("axios");
const { generateFHIRServiceRequest } = require("../../utils/referral");
const { CLIENT_REGISTRY } = require("../../../config");
const echis = require("../../utils/echis");
const { updateContactCRID } = require("./client");
const { logger } = require("../../utils/logger");

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  auth: {
    username: CLIENT_REGISTRY.user,
    password: CLIENT_REGISTRY.pass,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

const getContactCRID = async (instance, contactID) => {
  const contact = await echis.getDoc(
    echis.getInstanceConf(instance),
    contactID
  );
  if (contact.client_registry?.id) {
    return { id: contact.client_registry.id };
  }
  try {
    let fields = await updateContactCRID(instance, contactID);
    return { id: fields.client_registry.id };
  } catch (err) {
    logger.error(err.message);
    return { err };
  }
};

const sendServiceRequest = async (instance, record) => {
  let { id, err } = await getContactCRID(instance, record._patient_id);
  if (!id) {
    throw new Error(
      `CR ID not found for contact ${instance}/${record._patient_id}: ${err}}`
    );
  }
  const serviceRequest = generateFHIRServiceRequest(instance, id, record);
  return axiosInstance.post(
    `${FHIR_URL}/fhir/ServiceRequest`,
    JSON.stringify(serviceRequest)
  );
};

module.exports = {
  sendServiceRequest,
};
