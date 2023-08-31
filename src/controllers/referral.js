const axios = require("axios");
const { generateFHIRServiceRequest } = require("../utils/referral");
const { generateToken } = require("../utils/auth");
const { FHIR, CHT } = require("../../config");
const FHIR_URL = `${FHIR.url}/fhir-server/api/v4`;
const { logger } = require("../utils/logger");
const {
  createClientInRegistry,
  getEchisDocForUpdate,
  updateEchisDocWithUpi,
  generateClientRegistryPayload,
} = require("../controllers/client");
const { messages } = require("../utils/messages");
const {
  CREATE_FACILITY_REFERRAL,
  GENERATE_FHIR_SR,
  ATTRIB_NOT_FOUND,
  DATA_RECORD,
  CALLING_FHIR_SERVER,
  FHIR_SERVER_RESPONSE,
  SERVICE_REQUEST_ID,
  PROCESSING_SR_ID,
  SEARCHING_ECHIS_WITH_UPI,
  CLIENT_FOUND_REPORT_IN_ECHIS,
  COMPLETED_SUCCESSFULLY,
} = messages;

const getSubjectUpi = async (dataRecord) => {
  logger.information(DATA_RECORD);
  logger.information(JSON.stringify(dataRecord));
  let upi = dataRecord.upi;

  if (!upi) {
    const echisDoc = await getEchisDocForUpdate(dataRecord._patient_id);
    upi = echisDoc.upi;
  }

  if (!upi) {
    upi = await createClientInRegistry(
      JSON.stringify(generateClientRegistryPayload(dataRecord))
    );
    await updateEchisDocWithUpi(upi, dataRecord);
  }
  return upi;
};

const createFacilityReferral = async (CHTDataRecordDoc) => {
  logger.information(CREATE_FACILITY_REFERRAL);
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

    CHTDataRecordDoc.upi = await getSubjectUpi(CHTDataRecordDoc);
    if (!CHTDataRecordDoc.upi) {
      logger.error(ATTRIB_NOT_FOUND);
      throw ATTRIB_NOT_FOUND;
    }

    const FHIRServiceRequest = generateFHIRServiceRequest(CHTDataRecordDoc);
    logger.information(JSON.stringify(FHIRServiceRequest));
    logger.information(CALLING_FHIR_SERVER);
    //replicateRequest(FHIRServiceRequest);
    const response = await axiosInstance.post(
      `${FHIR_URL}/ServiceRequest`,
      JSON.stringify(FHIRServiceRequest)
    );
    console.log(response);
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

const createCommunityReferral = async (serviceRequest) => {
  try {
    const axiosInstance = axios.create({
      baseURL: CHT.url,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: CHT.username,
        password: CHT.password,
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
      return response;
    }
    return { status: 200, data: "done" };
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const createTaskReferral = async (serviceRequest) => {
  try {
    const serviceRequestId = serviceRequest?.id;
    logger.information(`${PROCESSING_SR_ID} ${serviceRequestId}`);

    const axiosInstance = axios.create({
      baseURL: CHT.url,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: CHT.username,
        password: CHT.password,
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
      const notesDeserialize = JSON.parse(serviceRequest?.note[0].text); //Remove backslash and parse JSON

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

const replicateRequest = (async = (FHIRServiceRequest) => {
  logger.information("Replicating Request to Alternate FHIR SERVER");
  const apiUrl =
    "https://interoperabilitylab.uonbi.ac.ke/test/fhir-server/api/v4/ServiceRequest";
  const authHeader = {
    username: "fhiruser",
    password: "change-password",
  };
  axios
    .post(apiUrl, JSON.stringify(FHIRServiceRequest), {
      headers: {
        "Content-Type": "application/fhir+json",
        Authorization: `Basic ${Buffer.from(
          `${authHeader.username}:${authHeader.password}`
        ).toString("base64")}`,
      },
    })
    .then((response) => {
      logger.information("Response: " + response.data);
    })
    .catch((error) => {
      logger.error(error);
    });
});

module.exports = {
  createFacilityReferral,
  createCommunityReferral,
  createTaskReferral,
};
