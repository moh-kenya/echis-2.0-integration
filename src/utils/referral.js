require("dotenv/config");

const { DateTime } = require('luxon');
const axios = require("axios");
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const { FHIR } = require("./config");
const FHIR_URL = FHIR.url;

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
          system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '25273',
          display: 'PIH HUM Ortho Procedures'
        }
      ],
      text: 'Procedure'
    }
  ],
  code: {
    coding: [
      {
        system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
        code: '25116',
        display: 'Manipulation of knee joint under anesthesia'
      }
    ],
    text: 'Manipulation of knee joint under anesthesia'
  },
  priority: 'urgent',
  subject: {
    reference: 'Patient/MOH1664351915',
    display: 'John Doe'
  },
  occurrenceDateTime: '2016-09-27',
  authoredOn: '2016-09-20',
  requester: {
    reference: 'PractitionerRole/123456'
  },
  performer: [
    {
      reference: 'Organization/13023'
    }
  ],
  reasonCode: [
    {
      coding: [
        {
          system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '25652',
          display: 'Problem Knee'
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
    resourceType: 'ServiceRequest',
    status: 'active',
    intent: 'order',
    category: [
      {
        coding: [
          {
            system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
            code: '25273',
            display: 'PIH HUM Ortho Procedures'
          }
        ],
        text: 'Procedure'
      }
    ],
    code: {
      coding: [
        {
          system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '25116',
          display: 'Manipulation of knee joint under anesthesia'
        }
      ],
      text: 'Manipulation of knee joint under anesthesia'
    },
    priority: 'urgent',
    subject: {
      reference: `Patient/${dataRecord.upi}`,
      display: dataRecord.name,
    },
    occurrenceDateTime: DateTime.fromMillis(dataRecord.reported_date),
    authoredOn: DateTime.local().toISODate(),
    requester: {
      reference: `Organization/${dataRecord.chuCode}`
    },
    performer: [
      {
        reference: `Organization/${dataRecord.chuCode}`
      }
    ],
    reasonCode: [
      {
        coding: [
          {
            system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
            code: '25652',
            display: 'Problem Knee'
          }
        ]
      }
    ],
    note: [
      {
        text: 'Any additional text that needs to be sent'
      }
    ]
  }
  return FHITServiceRequest;
};

const saveFHIRServiceRequest = async (dataRecord) => {
  const FHIRServiceRequest = generateFHIRServiceRequest(dataRecord);
  const response = await axiosInstance.post(`${FHIR_URL}/ServiceRequest`, FHIRServiceRequest);
  return response;
};

module.exports = {
  generateFHIRServiceRequest
}
