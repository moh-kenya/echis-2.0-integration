const axios = require('axios');
const { generateFHIRServiceRequest } = require('../utils/referral');
const {generateToken} = require("../utils/auth");
const { FHIR } = require('../../config');
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

module.exports = {
  createFacilityReferral
};
