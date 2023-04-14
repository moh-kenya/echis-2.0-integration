require('dotenv/config');
const { DateTime } = require('luxon');
const { CLIENT_REGISTRY, NHDD, SNOMED_CT, CHT } = require('../../config');
const NHDD_URL = `${NHDD.url}/orgs/MOH-KENYA/sources`;
const SNOMED_CT_URL = SNOMED_CT.url;
const CLIENT_REGISTRY_URL = `${CLIENT_REGISTRY.url}/partners/registry/search/upi`;
const NHDD_GENERIC_PATH = `${NHDD_URL}/nhdd/concepts/`;
const NHDD_KMHFL_PATH = `${NHDD_URL}/KMHFL/concepts`;
const CHT_URL = CHT.url;

const echisNHDDValuesCoding = {
  vaginal_bleeding: {
    system: NHDD_GENERIC_PATH,
    code: `49168`,
    display: `Vaginal Bleeding`
  },
  fits: {
    system: NHDD_GENERIC_PATH,
    code: `40356`,
    display: `Fits`
  },
  severe_abdominal_pain: {
    system: NHDD_GENERIC_PATH,
    code: `18523`,
    display: `Severe Abdominal Pain`
  },
  severe_headache: {
    system: NHDD_GENERIC_PATH,
    code: `9636`,
    display: `Severe Headache`
  },
  very_pale: {
    system: NHDD_GENERIC_PATH,
    code: `21598`,
    display: `Very Pale`
  },
  fever: {
    system: NHDD_GENERIC_PATH,
    code: `32879`,
    display: `Fever`
  },
  reduced_or_no_fetal_movement: {
    system: NHDD_GENERIC_PATH,
    code: `46048`,
    display: `Reduced or no fetal movement`
  },
  breaking_of_water : {
    system: NHDD_GENERIC_PATH,
    code: `32011`,
    display: `Breaking of water`
  },
  getting_tired_easily: {
    system: SNOMED_CT_URL,
    code: `248268002`,
    display: `Getting tired easily`
  },
  swelling_of_the_face_and_hands: {
    system: NHDD_GENERIC_PATH,
    code: `18838`,
    display: `Swelling of the face and hands`
  },
  breathlessness: {
    system: NHDD_GENERIC_PATH,
    code: `5142`,
    display: `Breathlessness`
  },
  none: {
    system: NHDD_GENERIC_PATH,
    code: `48590`,
    display: `None`
  },
  other: {
    system: NHDD_GENERIC_PATH,
    code: `12737`,
    display: `Other`
  },
  lack_of_sleep: {
    system: NHDD_GENERIC_PATH,
    code: `29541`,
    display: `Lack of sleep`
  },
  feeling_of_worthlessness: {
    system: SNOMED_CT_URL,
    code: `247892001`,
    display: `Feeling of worthlessness`
  },
  staying_away_from_people: {
    system: NHDD_GENERIC_PATH,
    code: `29644`,
    display: `Staying away from people`
  },
  tearfulness: {
    system: SNOMED_CT_URL,
    code: `271951008`,
    display: `Tearfulness`
  },
  lack_of_hygiene: {
    system: NHDD_GENERIC_PATH,
    code: `41667`,
    display: `Lack of hygiene`
  },
  anxiety: {
    system: NHDD_GENERIC_PATH,
    code: `15111`,
    display: `Anxiety/worried for no apparent reason`
  },
  irritability: {
    system: NHDD_GENERIC_PATH,
    code: `12218`,
    display: `Irritability/agitated`
  }
};

const extractNotes = (data) => {
  const notes = {};
  for (const [key, value] of Object.entries(data)) {
    if(value){
      notes[key] = value;
    }
  }
  return [{text: `${JSON.stringify(notes)}`}];
};

const extractReasonCode = (data) => {
  let coding = [];
  const reasons = [...new Set((Object.values(data).map(str => str.split(' '))).flat())].filter(elem => elem !== `none`);
  reasons.forEach(reason => coding.push(echisNHDDValuesCoding[reason]));
  return [{coding: coding}];
};

const FHIRServiceRequestStatus = [
  `draft`,
  `revoked`
];

const followUpInstruction = {
  revoked: `Missed visit`,
  completed: ``
};

const healthFacilityContact = {
  revoked: ``,
  completed: ``
};

const generateFHIRServiceRequest = (dataRecord) => {
  const reportedDate = DateTime.fromMillis(dataRecord.reported_date);
  const FHITServiceRequest = {
    resourceType: `ServiceRequest`,
    identifier: [
      {
        system: `${CHT_URL}/medic/`,
        value: dataRecord._id
      }
    ],
    status: FHIRServiceRequestStatus[0],
    intent: `order`,
    category: [
      {
        coding: [
          {
            system: NHDD_GENERIC_PATH,
            code: `28414`,
            display: `Patient referred for medical consultation`
          }
        ],
        text: `Consultation`
      }
    ],
    priority: `urgent`,
    subject: {
      reference: `${CLIENT_REGISTRY_URL}/${dataRecord.upi}`,
      type: `Patient`,
      display: dataRecord.upi
    },
    occurrencePeriod: {
      resourceType: `Period`,
      start: reportedDate.toISODate(),
      end: dataRecord.follow_up_date
    },
    authoredOn: reportedDate.toISODate(),
    requester: {
      reference: `${NHDD_KMHFL_PATH}/${dataRecord.chu_code}`,
      type: `Organization`,
      display: dataRecord.chu_name
    },
    performer: [
      {
        reference: `${NHDD_KMHFL_PATH}/${dataRecord.referred_to_facility_code}`,
        type: `Organization`,
        display: dataRecord.referred_to_facility_name
      }
    ],
    reasonCode: extractReasonCode(dataRecord.screening),
    note: extractNotes(dataRecord.supportingInfo)
  };
  return FHITServiceRequest;
};

module.exports = {
  generateFHIRServiceRequest,
  FHIRServiceRequestStatus,
  followUpInstruction,
  healthFacilityContact
};
