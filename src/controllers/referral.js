const axios = require('axios');
const { generateFHIRServiceRequest, FHIRServiceRequestStatus, generateEchisDataRecord } = require('../utils/referral');
const { generateToken } = require("../utils/auth");
const { FHIR, CHT } = require('../../config');
const FHIR_URL = FHIR.url;
const { logger } = require('../utils/logger');
const { createClientInRegistry, getEchisDocForUpdate, updateEchisDocWithUpi, generateClientRegistryPayload } = require('../controllers/client');
const { DateTime } = require('luxon');

const getSubjectUpi = async (dataRecord) => {
  logger.information("Data record");
  logger.information(JSON.stringify(dataRecord));
  let upi = dataRecord.upi;

  if(!upi){
    const echisDoc = await getEchisDocForUpdate(dataRecord._patient_id);
    upi = echisDoc.upi;
  }

  if(!upi){
    upi = await createClientInRegistry(JSON.stringify(generateClientRegistryPayload(dataRecord)));
    await updateEchisDocWithUpi(upi, dataRecord);
  }
  return upi;
};

const createFacilityReferral = async (CHTDataRecordDoc) => {
  logger.information("Creating facility referral");
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
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
    logger.information("Generating FHIR ServiceRequest");
    
    CHTDataRecordDoc.upi = await getSubjectUpi(CHTDataRecordDoc);
    if (!CHTDataRecordDoc.upi) {
      const error = `Attribute not found: UPI`;
      logger.error(error);
      throw error;
    }
    
    const FHIRServiceRequest = generateFHIRServiceRequest(CHTDataRecordDoc);
    logger.information(JSON.stringify(FHIRServiceRequest));
    logger.information("Calling MOH FHIR server");
    const response = await axiosInstance.post(`${FHIR_URL}/ServiceRequest`, JSON.stringify(FHIRServiceRequest));
    const location = response.headers.location.split("/");
    logger.information("MOH FHIR server response");
    logger.information(`Service Request Id ${location.at(-3)}`);

    return { status: response.status, serviceRequestId: location.at(-3)};
  } catch (error) {
    logger.error(error.message);

    if (!error.status) {
      return {status: 400, patient: {message: error.message}};
    }

    return {status: error.status, patient: error.data};
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
    const { data } = await axiosInstance.get(`medic/_design/medic/_view/contacts_by_upi?key="${UPI}"`);
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
    return {status: 200, data: 'done'}
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const createTaskReferral = async (serviceRequest) => {
  try {
    let axiosInstance = axios.create({
      baseURL: CHT.url,
      headers: {
        "Content-Type": "application/json",
      },
      auth: {
        username: CHT.username,
        password: CHT.password,
      },
    });
    // first chekc system is echis
      // get client UPI
    const UPI = serviceRequest?.subject?.reference?.split("/").pop();
    // use contacts_by_type_freetext view for upreades sake
    const { data } = await axiosInstance.get(`medic/_design/medic/_view/contacts_by_upi?key="${UPI}"`);
    if (data.rows.length > 0) {
      const patientDoc = data.rows[0].value;
      const body = generateEchisDataRecord(serviceRequest, UPI, patientDoc._id);
      let response = await axiosInstance.post(`api/v2/records`, body);

      // proceed to update status of the request in fhir
      axiosInstance = axios.create({
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
          if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
      serviceRequest.status = FHIRServiceRequestStatus[2];
      response = await axiosInstance.put(`${FHIR_URL}/ServiceRequest`, JSON.stringify(serviceRequest));
      return response;
    }
    return { status: 200, serviceRequestId: serviceRequest?.id};
  } catch (error) {
    logger.error(error);
    return error;
  }
};

module.exports = {
  createFacilityReferral,
  createCommunityReferral,
  createTaskReferral
};
