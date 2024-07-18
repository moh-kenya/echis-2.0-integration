const axios = require("axios");
const { generateFHIRServiceRequest } = require("../utils/referral");
const { TIBERBU_SERVICE, getCHTValuesFromEnv } = require("../../config");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const echis = require("../utils/echis");
const { updateContactCRID } = require("./client");
const {
  PROCESSING_SR_ID,
  SEARCHING_ECHIS_WITH_UPI,
  CLIENT_FOUND_REPORT_IN_ECHIS,
  COMPLETED_SUCCESSFULLY,
} = messages;

const axiosInstance = axios.create({
  baseURL: TIBERBU_SERVICE.url,
  auth: {
    username: TIBERBU_SERVICE.user,
    password: TIBERBU_SERVICE.pass,
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

const createCommunityReferral = async (serviceRequest, res) => {
const createCommunityReferral = async (serviceRequest, res) => {
  try {
    const instanceValue = res.locals.instanceValue;
    const chtInstanceVariables = getCHTValuesFromEnv(instanceValue);
    const axiosInstance = axiosInstance.create({
      baseURL: chtInstanceVariables.url,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: chtInstanceVariables.username,
        password: chtInstanceVariables.password,
      },
    });

    const UPI = serviceRequest?.subject?.reference?.split("/").pop();
    const { data } = await axiosInstance.get(
      `medic/_design/medic/_view/contacts_by_upi?key="${UPI}"`
    );
    if (data.rows.length > 0) {
      const patientDoc = data.rows[0].value;

      const body = {
        _meta: {
          form: "interop_follow_up",
        },
        patient_uuid: patientDoc._id,
      };

      const response = await axiosInstance.post(`api/v2/records`, body);
      return { status: 200, data: response };
      return { status: 200, data: response };
    }
    return { status: 200, data: "done" };
  } catch (error) {
    logger.error(error);
    return { status: 500, errors: error };
    return { status: 500, errors: error };
  }
};

const createTaskReferral = async (serviceRequest, res) => {
const createTaskReferral = async (serviceRequest, res) => {
  try {
    const instanceValue = res.locals.instanceValue;
    const chtInstanceVariables = getCHTValuesFromEnv(instanceValue);
    const serviceRequestId = serviceRequest?.id;
    logger.information(`${PROCESSING_SR_ID} ${serviceRequestId}`);

    const axiosInstance = axiosInstance.create({
      baseURL: chtInstanceVariables.url,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: chtInstanceVariables.username,
        password: chtInstanceVariables.password,
      },
    });

    const UPI = serviceRequest?.subject?.reference?.split("/").pop();
    logger.information(`${SEARCHING_ECHIS_WITH_UPI} ${UPI}`);
    const { data } = await axiosInstance.get(
      `medic/_design/medic/_view/contacts_by_upi?key="${UPI}"`
    );
    if (data.rows.length > 0) {
      logger.information(CLIENT_FOUND_REPORT_IN_ECHIS);
      const patientDoc = data.rows[0].value;
      const notesDeserialize = serviceRequest?.note[0].text;

      const body = {
        _meta: {
          form: "REFERRAL_FOLLOWUP_AFYA_KE",
        },
        patient_id: patientDoc._id,
        subject: UPI,
        authored_on: serviceRequest?.authoredOn,
        date_service_offered: serviceRequest?.authoredOn,
        date_of_visit: serviceRequest?.authoredOn,
        follow_up_instruction: notesDeserialize.follow_up_instruction,
        health_facility_contact: notesDeserialize.health_facility_contact,
        status: serviceRequest?.status,
        fhir_service_request_uuid: serviceRequest?.id,
        source: `afya-ke`,
        source_report_uuid: serviceRequest?.identifier[0].value || ``,
      };

      const response = await axiosInstance.post(`api/v2/records`, body);
      logger.information(COMPLETED_SUCCESSFULLY);
      return response;
    }
    return { status: 200, serviceRequestId: serviceRequestId };
  } catch (error) {
    logger.error(error);
    return error;
  }
};

module.exports = {
  sendServiceRequest,
  createCommunityReferral,
  createTaskReferral,
};
