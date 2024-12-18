const axios = require("axios");
const { generateFHIRServiceRequest } = require("../utils/referral");
const { generateToken } = require("../utils/auth");
const { FHIR, getCHTValuesFromEnv } = require("../../config");
const FHIR_URL = `${FHIR.url}/fhir-server/api/v4`;
const { logger } = require("../utils/logger");
const { createCRClient } = require("../controllers/client");
const { messages } = require("../utils/messages");
const { getDoc } = require("../utils/echis");
const {
  CREATE_FACILITY_REFERRAL,
  GENERATE_FHIR_SR,
  ATTRIB_NOT_FOUND,
  CALLING_FHIR_SERVER,
  FHIR_SERVER_RESPONSE,
  SERVICE_REQUEST_ID,
  PROCESSING_SR_ID,
  SEARCHING_ECHIS_WITH_UPI,
  CLIENT_FOUND_REPORT_IN_ECHIS,
  COMPLETED_SUCCESSFULLY,
} = messages;

const getSubjectUpi = async (instance,echisClientId) => {
  var echisClient;
  let chtInstanceVariables = getCHTValuesFromEnv(instance);
  let instanceObject = { instance: chtInstanceVariables.url, user: chtInstanceVariables.username, password: chtInstanceVariables.password };
  try {
    echisClient = await getDoc(instanceObject, echisClientId);
    if (echisClient.upi) {
      return echisClient.upi;
    }
  } catch (err) {
    logger.error(`could not get subject upi: ${err.message}`);
    return;
  }
  try {
    const clientNumber = await createCRClient(instanceObject, echisClient)
    return clientNumber;
  } catch (err) {
    logger.error(`could not get subject upi, err while trying to create client ${err.message}`);
  }
  return
}

const createFacilityReferral = async (CHTDataRecordDoc, res) => {
  logger.information(CREATE_FACILITY_REFERRAL);
  const instanceValue = res.locals.instanceValue;
  try {
    const axiosInstance = axios.create({
      baseURL: FHIR.url,
      headers: {
        "Content-Type": "application/json",
      },
    });

    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async function (error) {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          const token = await generateToken();
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
    logger.information(GENERATE_FHIR_SR);

    let upi = CHTDataRecordDoc.upi
    if (!upi) {
      upi = await getSubjectUpi(instanceValue, CHTDataRecordDoc._patient_id);
      if (!upi) {
        throw new Error(ATTRIB_NOT_FOUND);
      }
      CHTDataRecordDoc.upi = upi;
    }

    const FHIRServiceRequest = generateFHIRServiceRequest(instanceValue, upi, CHTDataRecordDoc);
    logger.information(JSON.stringify(FHIRServiceRequest));
    logger.information(CALLING_FHIR_SERVER);
    //replicateRequest(FHIRServiceRequest);
    const response = await axiosInstance.post(
      `${FHIR_URL}/ServiceRequest`,
      JSON.stringify(FHIRServiceRequest)
    );
    const location = response.headers.location.split("/");
    logger.information(FHIR_SERVER_RESPONSE);
    logger.information(`${SERVICE_REQUEST_ID} ${location.at(-3)}`);

    return { status: response.status, serviceRequestId: location.at(-3) };
  } catch (error) {
    logger.error(error.message);

    if (!error.status) {
      return { status: 400, patient: { message: error.message } };
    }

    return { status: error.status, patient: error.data };
  }
};

const createCommunityReferral = async (serviceRequest, res) => {
  try {
    const instanceValue = res.locals.instanceValue;
    const chtInstanceVariables = getCHTValuesFromEnv(instanceValue);
    const axiosInstance = axios.create({
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
      `medic/_design/medic-client/_view/contacts_by_freetext?key="${UPI.toLowerCase()}"`
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
    }
    return { status: 200, data: "done" };
  } catch (error) {
    logger.error(error);
    return { status: 500, errors: error };
  }
};

const createTaskReferral = async (serviceRequest, res) => {
  try {
    const instanceValue = res.locals.instanceValue;
    const chtInstanceVariables = getCHTValuesFromEnv(instanceValue);
    const serviceRequestId = serviceRequest?.id;
    logger.information(`${PROCESSING_SR_ID} ${serviceRequestId}`);

    const axiosInstance = axios.create({
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
    const params = { key: JSON.stringify([UPI.toLowerCase()]) }
    const { data } = await axiosInstance.get(
      `medic/_design/medic-client/_view/contacts_by_freetext`, { params }
    );
    if (data.rows.length > 0) {
      logger.information(CLIENT_FOUND_REPORT_IN_ECHIS);
      const patientDoc = data.rows[0].value;
      const notesDeserialize = serviceRequest?.note[0].text;

      const body = {
        _meta: {
          form: "REFERRAL_FOLLOWUP_AFYA_KE",
        },
        patient_id: patientDoc.id,
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
  createFacilityReferral,
  createCommunityReferral,
  createTaskReferral,
};
