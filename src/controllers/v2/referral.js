const axios = require("axios");
const { generateFHIRServiceRequest } = require("../../utils/referral");
const { CLIENT_REGISTRY } = require("../../../config");
const echis = require("../../utils/echis");
const { updateContactCRID } = require("./client");

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
  if (!contact.client_registry?.id) {
    return await updateContactCRID(instance, contactID);
  } else {
    return contact.client_registry.id;
  }
};

const sendServiceRequest = async (instance, record) => {
  let contactCRID = await getContactCRID(instance, record._patient_id);
  if (!contactCRID) {
    throw new Error(
      `CR ID not found for contact ${instance}/${record._patient_id}`
    );
  }
  const serviceRequest = generateFHIRServiceRequest(
    instance,
    contactCRID,
    record
  );
  const response = await axiosInstance.post(
    `${FHIR_URL}/fhir/ServiceRequest`,
    JSON.stringify(serviceRequest)
  );
  const location = response.headers.location.split("/");
  return { status: response.status, serviceRequestId: location.at(-3) };
};

module.exports = {
  sendServiceRequest,
};
