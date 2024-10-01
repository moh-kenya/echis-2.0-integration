const axios = require("axios");
const { generateFHIRServiceRequest } = require("../../utils/referral");
const { HIE } = require("../../../config");
const echis = require("../../utils/echis");

const axiosInstance = axios.create({
  baseURL: HIE.url,
  auth: {
    username: HIE.user,
    password: HIE.pass,
  },
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

const sendServiceRequest = async (instance, record) => {
  const { data } = await echis.getDoc(
    echis.getInstanceConf(instance),
    record.patient_id
  );
  if (!data.cr_hie_id) {
    throw new Error(
      `CR ID not found for contact ${instance}/${record.patient_id}`
    );
  }
  const serviceRequest = generateFHIRServiceRequest(instance, data.upi, record);
  return axiosInstance.post(
    "/fhir/R4/ServiceRequest",
    JSON.stringify(serviceRequest)
  );
};

module.exports = {
  sendServiceRequest,
};
