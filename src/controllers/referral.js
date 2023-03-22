import axios from 'axios';
import { generateFHIRServiceRequest } from '../utils/referral';
import { FHIR } from '../../config';
import { logger } from '../../logger';
const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

const createFacilityReferral = async (CHTDataRecordDoc) => {
  try {
    const FHIRServiceRequest = generateFHIRServiceRequest(CHTDataRecordDoc);
    const res = await axios.post(`${fhirUrl}/ServiceRequest`, FHIRServiceRequest, {auth: {
      username: fhirUsername,
      password: fhirPassword,
    }});
    return {status: res.status, patient: res.data};
  } catch (error) {
    logger.error(error);

    if (!error.status) {
      return {status: 400, patient: {message: error.message}};
    }

    return {status: error.status, patient: error.data};
  }
};

module.exports = {
  createFacilityReferral
};
