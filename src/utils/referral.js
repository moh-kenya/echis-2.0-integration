require("dotenv/config");
const axios = require("axios");
const { DateTime } = require('luxon');
const { FHIR } = require('../../config');
const FHIR_URL = FHIR.url;

const axiosInstance = axios.create({
  baseURL: FHIR_URL,
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

const sampleEchisReferralPayload = {
  upi: '854a32fb-50a5-4ade-9c75-fd6e9a88e572',
  name: 'Ruth Melon',
  form: 'pregnancy_home_visit',
  has_lost_pregnancy_within_last_month: '',
  danger_signs: 'very_pale getting_tired_easily breathlessness',
  other_danger_sign: '',
  takes_iron_or_folate_supplements: 'yes',
  mental_danger_signs: 'staying_away_from_people tearfulness',
  other_mental_danger_sign: '',
  observed_mental_danger_signs: 'lack_of_hygiene anxiety irritability',
  other_observed_mental_danger_signs: '',
  is_still_pregnant: 'yes',
  has_started_anc: '',
  anc_upto_date: 'no',
  has_lost_pregnancy_within_last_month_subsequent_visit: '',
  pregnancy_test_result: '',
  is_pregnant: '',
  is_on_family_planning: '',
  period_of_pregnancy: '',
  known_lmp: '',
  next_anc_visit_date: '',
  reported_date: 1679413362551,
  chu_code: '701583',
  chu_name: 'Koluoch Community Health Unit',
  referred_to_facility_code: '17345',
  referred_to_facility_name: 'Ndege Oriedo Dispensary'  
};

const serviceRequestPayload = {
  resourceType: 'ServiceRequest',
  status: 'active',
  intent: 'order',
  category: [
    {
      coding: [
        {
          system: 'http://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '28414',
          display: 'Patient referred for medical consultation'
        }
      ],
      text: 'Consultation'
    }
  ],
  priority: 'urgent',
  subject: {
    reference: 'http://dhpstagingapi.health.go.ke/visit/registry/search/upi/MOH1664351915',
    type: 'Patient',
    display: 'MOH1664351915'
  },
  occurrencePeriod: {
    resourceType: 'Period',
    start: '2023-03-20',
    end: '2023-03-23'
  },
  authoredOn: '2023-03-20',
  requester: {
    reference: 'http://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/13023',
    type: 'Organization',
    display: '<chu code>'
  },
  performer: [
    {
      reference: 'http://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/13023',
      type: 'Organization',
      display: '<facility kmfl code>'
    }
  ],
  reasonCode: [
    {
      coding: [
        {
          system: 'http://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '9585',
          display: 'Severe headache'
        },
        {
          system: 'http://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '46048',
          display: 'Decreased fetal movements'
        }
      ]
    }
  ],
  note: [
    {
      text: 'Any additional text that needs to be sent'
    }
  ]
};

const echisNHDDValuesCoding = {
  // todo
};

const generateFHIRServiceRequest = (dataRecord) => {
  const FHITServiceRequest = {
  }
  return FHITServiceRequest;
};

const saveFHIRServiceRequest = async (dataRecord) => {
  const FHIRServiceRequest = generateFHIRServiceRequest(dataRecord);
  const response = await axiosInstance.post(`/ServiceRequest`, FHIRServiceRequest);
  return response;
};

module.exports = {
  generateFHIRServiceRequest
}
