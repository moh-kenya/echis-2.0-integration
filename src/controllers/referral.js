const axios = require('axios');
const { generateFHIRServiceRequest } = require('../utils/referral');
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
        if (error.response.status === 401 && !originalRequest._retry) {
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
    const response = await axiosInstance.post(`${FHIR_URL}/ServiceRequest`, FHIRServiceRequest);

    return response;
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
          form: "REFERRAL_FOLLOWUP_AFYA_KE",
        },
        patient_uuid: patientDoc._id,
        subject: patientDoc.subject,
        authoredOn: patientDoc.authoredOn,
        notes: patientDoc.notes,
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

module.exports = {
  createFacilityReferral,
  createCommunityReferral,
};
