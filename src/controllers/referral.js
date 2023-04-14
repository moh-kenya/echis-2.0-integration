const axios = require('axios');
const { generateFHIRServiceRequest, FHIRServiceRequestStatus, followUpInstruction, healthFacilityContact } = require('../utils/referral');
const {generateToken} = require("../utils/auth");
const { FHIR, CHT } = require('../../config');
const FHIR_URL = FHIR.url;

const createFacilityReferral = async (CHTDataRecordDoc) => {
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

    const FHIRServiceRequest = generateFHIRServiceRequest(CHTDataRecordDoc);
    const response = await axiosInstance.post(`${FHIR_URL}/ServiceRequest`, JSON.stringify(FHIRServiceRequest));
    const location = response.headers.location.split("/");
    console.log(`Service Request Id ${location.at(-3)}`);

    return { status: response.status, serviceRequestId: location.at(-3)};
  } catch (error) {
    console.error(error);

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
    console.error(error);
    return error;
  }
};

const createTaskReferral = async (serviceRequest) => {
  try {
    let serviceRequestId = null;
    /* 
      get id of service request from afya ke servicee request, which does not come with a uuid. we use the identifier object to search in fhir server
    */
    if(serviceRequest?.status === FHIRServiceRequestStatus[0]){
      const identifier = serviceRequest?.identifier[0];
      const searchParam = `${identifier.system}|${identifier.value}`;
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
            axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            return axiosInstance(originalRequest);
          }
          return Promise.reject(error);
        }
      );
      const response = await axiosInstance.post(`${FHIR_URL}/ServiceRequest/_search?identifier=${searchParam}`, ``);
      serviceRequestId = response[0].resource.id;
    }
    // todo: get id of service request from payload that updates service request oriinally from echis
    serviceRequestId = null;
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
        status: serviceRequest?.status,
        needs_follow_up: `${FHIRServiceRequestStatus.includes(serviceRequest?.status)}` || `false`,
        follow_up_instruction: followUpInstruction[serviceRequest?.status] || notesDeserialize.follow_up_instruction,
        health_facility_contact: healthFacilityContact[serviceRequest?.status] || notesDeserialize.health_facility_contact,
        fhir_service_request_uuid: serviceRequestId,
      };

      const response = await axiosInstance.post(`api/v2/records`, body);
      return response;
    }

    return { status: 200, serviceRequestId: location.at(-3)};
  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports = {
  createFacilityReferral,
  createCommunityReferral,
  createTaskReferral
};
