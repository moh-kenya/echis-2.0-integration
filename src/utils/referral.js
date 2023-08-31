require("dotenv/config");
const { DateTime } = require("luxon");
const {
  CLIENT_REGISTRY,
  NHDD,
  SNOMED_CT,
  CHT,
  KHMFL,
} = require("../../config");
const NHDD_URL = `${NHDD.url}/orgs/MOH-KENYA/sources`;
const KHMFL_FACILITY_URL = `${KHMFL.url}/api/facilities/facilities/`;
const KHMFL_CHUL_URL = `${KHMFL.url}/api/chul/units/`;
const SNOMED_CT_URL = SNOMED_CT.url;
const CLIENT_REGISTRY_URL = `${CLIENT_REGISTRY.url}/partners/registry/search/upi`;
const NHDD_GENERIC_PATH = `${NHDD_URL}/nhdd/concepts/`;
const NHDD_KMHFL_PATH = `${NHDD_URL}/KMHFL/concepts`;
const CHT_URL = CHT.url;

const echisNHDDValuesCoding = {
  vaginal_bleeding: {
    system: NHDD_GENERIC_PATH,
    code: `49168`,
    display: `Vaginal Bleeding`,
  },
  fits: {
    system: NHDD_GENERIC_PATH,
    code: `40356`,
    display: `Fits`,
  },
  severe_abdominal_pain: {
    system: NHDD_GENERIC_PATH,
    code: `18523`,
    display: `Severe Abdominal Pain`,
  },
  severe_headache: {
    system: NHDD_GENERIC_PATH,
    code: `9636`,
    display: `Severe Headache`,
  },
  very_pale: {
    system: NHDD_GENERIC_PATH,
    code: `21598`,
    display: `Very Pale`,
  },
  fever: {
    system: NHDD_GENERIC_PATH,
    code: `32879`,
    display: `Fever`,
  },
  reduced_or_no_fetal_movement: {
    system: NHDD_GENERIC_PATH,
    code: `46048`,
    display: `Reduced or no fetal movement`,
  },
  breaking_of_water: {
    system: NHDD_GENERIC_PATH,
    code: `32011`,
    display: `Breaking of water`,
  },
  getting_tired_easily: {
    system: SNOMED_CT_URL,
    code: `248268002`,
    display: `Getting tired easily`,
  },
  swelling_of_the_face_and_hands: {
    system: NHDD_GENERIC_PATH,
    code: `18838`,
    display: `Swelling of the face and hands`,
  },
  breathlessness: {
    system: NHDD_GENERIC_PATH,
    code: `5142`,
    display: `Breathlessness`,
  },
  none: {
    system: NHDD_GENERIC_PATH,
    code: `48590`,
    display: `None`,
  },
  other: {
    system: NHDD_GENERIC_PATH,
    code: `12737`,
    display: `Other`,
  },
  lack_of_sleep: {
    system: NHDD_GENERIC_PATH,
    code: `29541`,
    display: `Lack of sleep`,
  },
  feeling_of_worthlessness: {
    system: SNOMED_CT_URL,
    code: `247892001`,
    display: `Feeling of worthlessness`,
  },
  staying_away_from_people: {
    system: NHDD_GENERIC_PATH,
    code: `29644`,
    display: `Staying away from people`,
  },
  tearfulness: {
    system: SNOMED_CT_URL,
    code: `271951008`,
    display: `Tearfulness`,
  },
  lack_of_hygiene: {
    system: NHDD_GENERIC_PATH,
    code: `41667`,
    display: `Lack of hygiene`,
  },
  anxiety: {
    system: NHDD_GENERIC_PATH,
    code: `15111`,
    display: `Anxiety/worried for no apparent reason`,
  },
  irritability: {
    system: NHDD_GENERIC_PATH,
    code: `12218`,
    display: `Irritability/agitated`,
  },
  pregnancy_home_visit: {
    system: NHDD_GENERIC_PATH,
    code: `54075`,
    display: `Antenatal Clinic`,
  },
  out_patient: {
    system: NHDD_GENERIC_PATH,
    code: `28023`,
    display: `Outpatient Department`,
  },
  orthopedic: {
    system: NHDD_GENERIC_PATH,
    code: `28175`,
    display: `Orthopedic Department`,
  },
  psych: {
    system: NHDD_GENERIC_PATH,
    code: `28183`,
    display: `Psychiatry Department`,
  },
  sgbv: {
    system: NHDD_GENERIC_PATH,
    code: `54086`,
    display: `SGBV Clinic`,
  },
  in_patient: {
    system: NHDD_GENERIC_PATH,
    code: `15170`,
    display: `Inpatient Department`,
  },
  family_planning: {
    system: NHDD_GENERIC_PATH,
    code: `54076`,
    display: `Family Planning Clinic`,
  },
  pnc_home_visit: {
    system: NHDD_GENERIC_PATH,
    code: `54077`,
    display: `Postnatal Clinic`,
  },
  dental_clinic: {
    system: NHDD_GENERIC_PATH,
    code: `54078`,
    display: `Dental Clinic`,
  },
  pnc_home_visit: {
    system: NHDD_GENERIC_PATH,
    code: `54077`,
    display: `Postnatal Clinic`,
  },
  gyna: {
    system: NHDD_GENERIC_PATH,
    code: `54079`,
    display: `Gynecology Clinic`,
  },
  paeds: {
    system: NHDD_GENERIC_PATH,
    code: `54080`,
    display: `Pediatric Clinic`,
  },
  psych: {
    system: NHDD_GENERIC_PATH,
    code: `54082`,
    display: `Physiotherapy Clinic`,
  },
  nutrition_clinic: {
    system: NHDD_GENERIC_PATH,
    code: `54084`,
    display: `Nutrition Clinic`,
  },
  child_welfare: {
    system: NHDD_GENERIC_PATH,
    code: `54085`,
    display: `Child Welfare Clinic`,
  },
  ccc: {
    system: NHDD_GENERIC_PATH,
    code: `25067`,
    display: `CCC`,
  },
};

const extractNotes = (data) => {
  const notes = {};
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      notes[key] = value;
    }
  }
  return [{ text: `${JSON.stringify(notes)}` }];
};

const extractReasonCode = (data) => {
  let reasonCodes = [];
  const reasons = [
    ...new Set(
      Object.values(data)
        .map((str) => str.split(" "))
        .flat()
    ),
  ].filter((elem) => elem !== `none`);
  reasons.forEach((reason) => {
    const coding = echisNHDDValuesCoding[reason];
    return reasonCodes.push({
      coding: [coding],
      text: coding.display,
    });
  });
  return reasonCodes;
};

const status = [`draft`, `active`, `revoked`, `completed`];

const generateFHIRServiceRequest = (dataRecord) => {
  const reportedDate = DateTime.fromMillis(dataRecord.reported_date);
  const FHITServiceRequest = {
    resourceType: `ServiceRequest`,
    identifier: [
      {
        system: `${CHT_URL}/medic/`,
        value: dataRecord._id,
      },
    ],
    status: status[1],
    intent: `order`,
    category: [
      {
        coding: [echisNHDDValuesCoding[dataRecord.service]],
        text: `Consultation`,
      },
    ],
    priority: `urgent`,
    subject: {
      reference: `${CLIENT_REGISTRY_URL}/${dataRecord.upi}`,
      type: `Patient`,
      display: dataRecord.upi,
      identifier: {
        use: `official`,
        system: `${CLIENT_REGISTRY_URL}/${dataRecord.upi}`,
        value: dataRecord.upi,
      },
    },
    occurrencePeriod: {
      resourceType: `Period`,
      start: reportedDate.toISODate(),
      end: dataRecord.follow_up_date,
    },
    authoredOn: reportedDate.toISODate(),
    requester: {
      reference: `${KHMFL_CHUL_URL}?format=JSON&code=${dataRecord.chu_code}`,
      type: `Organization`,
      display: dataRecord.chu_code,
      identifier: {
        use: `official`,
        system: `${KHMFL_CHUL_URL}?format=JSON&code=${dataRecord.chu_code}`,
        value: dataRecord.chu_code,
      },
    },
    performer: [
      {
        reference: `${KHMFL_FACILITY_URL}?format=JSON&code=${dataRecord.referred_to_facility_code}`,
        type: `Organization`,
        display: dataRecord.referred_to_facility_code,
        identifier: {
          use: `official`,
          system: `${KHMFL_FACILITY_URL}?format=JSON&code=${dataRecord.referred_to_facility_code}`,
          value: dataRecord.referred_to_facility_code,
        },
      },
    ],
    reasonCode: extractReasonCode(dataRecord.screening),
    note: extractNotes(dataRecord.supportingInfo),
  };
  return FHITServiceRequest;
};

module.exports = {
  generateFHIRServiceRequest,
};
