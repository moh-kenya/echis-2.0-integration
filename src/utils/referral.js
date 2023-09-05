require('dotenv/config');
const { DateTime } = require('luxon');
const { CLIENT_REGISTRY, NHDD, SNOMED_CT, CHT } = require('../../config');
const NHDD_URL = `${NHDD.url}/orgs/MOH-KENYA/sources`;
const SNOMED_CT_URL = SNOMED_CT.url;
const CLIENT_REGISTRY_URL = `${CLIENT_REGISTRY.url}/partners/registry/search/upi`;
const NHDD_GENERIC_PATH = `${NHDD_URL}/nhdd/concepts/`;
const NHDD_KMHFL_PATH = `${NHDD_URL}/KMHFL/concepts`;
const CHT_URL = CHT.url;

// # https://nhdd.health.go.ke/#/orgs/MOH-KENYA/sources/nhdd/concepts/24499/

const echisNHDDValuesCoding = {
  // vaginal_bleeding: {
  //   system: NHDD_GENERIC_PATH,
  //   code: `49168`,
  //   display: `Vaginal Bleeding`
  // },
  // fits: {
  //   system: NHDD_GENERIC_PATH,
  //   code: `40356`,
  //   display: `Fits`
  // },
  // severe_abdominal_pain: {
  //   system: NHDD_GENERIC_PATH,
  //   code: `18523`,
  //   display: `Severe Abdominal Pain`
  // },
  // severe_headache: {
  //   system: NHDD_GENERIC_PATH,
  //   code: `9636`,
  //   display: `Severe Headache`
  // },
  // very_pale: {
  //   system: NHDD_GENERIC_PATH,
  //   code: `21598`,
  //   display: `Very Pale`
  // },
  // fever: {
  //   system: NHDD_GENERIC_PATH,
  //   code: `32879`,
  //   display: `Fever`
  // },
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
  // getting_tired_easily: {
  //   system: SNOMED_CT_URL,
  //   code: `248268002`,
  //   display: `Getting tired easily`
  // },
  swelling_of_the_face_and_hands: {
    system: NHDD_GENERIC_PATH,
    code: `18838`,
    display: `Swelling of the face and hands`
  },
  breathlessness: {
    system: NHDD_GENERIC_PATH,
    code: `5154`,
    display: `Breathlessness,Shortness of breath`
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
  // feeling_of_worthlessness: {
  //   system: SNOMED_CT_URL,
  //   code: `247892001`,
  //   display: `Feeling of worthlessness`
  // },
  staying_away_from_people: {
    system: NHDD_GENERIC_PATH,
    code: `29644`,
    display: `Social isolaton`
  },
  // tearfulness: {
  //   system: SNOMED_CT_URL,
  //   code: `271951008`,
  //   display: `Tearfulness`
  // },
  lack_of_hygiene: {
    system: NHDD_GENERIC_PATH,
    code: `41667`,
    display: `Very Low Level Of Personal Hygiene`
  },
  anxiety: {
    system: NHDD_GENERIC_PATH,
    code: `15111`,
    display: `Feeling constantly worried`
  },
  irritability: {
    system: NHDD_GENERIC_PATH,
    code: `12218`,
    display: `Irritability`
  },
  // new

  cocs: {
    system: NHDD_GENERIC_PATH,
    code: "29510",
    display: "Combined Oral Contraceptive Pills",
  },
  injectables: {
    system: NHDD_GENERIC_PATH,
    code: "13241",
    display: "Injectable Contraceptives",
  },
  iucd: {
    system: NHDD_GENERIC_PATH,
    code: "13250",
    display: "Intrauterine Device",
  },
  condoms: {
    system: NHDD_GENERIC_PATH,
    code: "14206",
    display: "Condoms",
  },
  tubal_ligation: {
    system: NHDD_GENERIC_PATH,
    code: "49252",
    display: "Tubal Ligation Procedure",
  },
  cycle_beads: {
    system: NHDD_GENERIC_PATH,
    code: "21655",
    display: "CycleBeads",
  },
  vasectomy: {
    system: NHDD_GENERIC_PATH,
    code: "46482",
    display: "Vasectomy",
  },
  fever: {
    system: NHDD_GENERIC_PATH,
    code: "7579",
    display: "Fever",
  },
  severe_headache: {
    system: NHDD_GENERIC_PATH,
    code: "9585",
    display: "Severe Headache",
  },
  heavy_vaginal_bleeding: {
    system: NHDD_GENERIC_PATH,
    code: "43086",
    display: "Abnormal Vaginal Bleeding",
  },
  foul_smelling_discharge: {
    system: NHDD_GENERIC_PATH,
    code: "18901",
    display: "Foul Smelling Vaginal Discharge",
  },
  cracked_and_painful_nipples: {
    system: NHDD_GENERIC_PATH,
    code: "2371",
    display: "Cracked Nipple Associated with Childbirth",
  },
  convulsions: {
    system: NHDD_GENERIC_PATH,
    code: "46463",
    display: "Convulsions",
  },
  not_feeding: {
    system: NHDD_GENERIC_PATH,
    code: "12229",
    display: "Refusal to Feed",
  },
  fast_breathing: {
    system: NHDD_GENERIC_PATH,
    code: "31922",
    display: "Tachypnea",
  },
  chest_indrawn: {
    system: NHDD_GENERIC_PATH,
    code: "13073",
    display: "Intercostal Recession",
  },
  fever_newborn: {
    system: NHDD_GENERIC_PATH,
    code: "40206",
    display: "Fever of Newborn",
  },
  umbilical_stump_bleeding: {
    system: NHDD_GENERIC_PATH,
    code: "34215",
    display: "Umbilical Bleeding",
  },
  red: {
    system: NHDD_GENERIC_PATH,
    code: "26926",
    display: "Red Color",
  },
  yellow: {
    system: NHDD_GENERIC_PATH,
    code: "27300",
    display: "Yellow Color",
  },
  green: {
    system: NHDD_GENERIC_PATH,
    code: "27302",
    display: "Green Color",
  },
  bcg: {
    system: NHDD_GENERIC_PATH,
    code: "10512",
    display: "BCG Vaccine",
  },
  opv_0: {
    system: NHDD_GENERIC_PATH,
    code: "6032",
    display: "Polio Vaccination, Oral",
  },
  pcv_1: {
    system: NHDD_GENERIC_PATH,
    code: "24499",
    display: "Decavalent Pneumococcal Vaccine (Pneumococcal Conjugate Vaccine)",
  },
  penta_1: {
    system: NHDD_GENERIC_PATH,
    code: "14676",
    display: "Diphtheria Toxoid / Hepatitis B Vaccines / Pertussis, Acellular / Tetanus Toxoid / Haemophilus Capsular Oligosaccharide",
  },
  ipv: {
    system: NHDD_GENERIC_PATH,
    code: "3547",
    display: "Poliovirus Vaccine, Inactivated",
  },
  rota_1: {
    system: NHDD_GENERIC_PATH,
    code: "2760",
    display: "Rotavirus Vaccines",
  },
  vitamin_a: {
    system: NHDD_GENERIC_PATH,
    code: "1107",
    display: "Vitamin A",
  },
  measles_9_months: {
    system: NHDD_GENERIC_PATH,
    code: "5456",
    display: "Measles Vaccine",
  },
  delivery_place: {
    system: NHDD_GENERIC_PATH,
    code: "44291",
    display: "Delivered at Home",
  },
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
  let reasonCodes = [];
  const reasons = [...new Set((Object.values(data).map(str => str.split(' '))).flat())].filter(elem => elem !== `none`);
  reasons.forEach(reason => {
    const coding = echisNHDDValuesCoding[reason];
    return reasonCodes.push({
      coding: [coding],
      text: coding.display
    });
  });
  return reasonCodes;
};

const status = [
  `draft`,
  `active`,
  `revoked`,
  `completed`
];

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
    status: status[0],
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
      display: dataRecord.chu_code
    },
    performer: [
      {
        reference: `${NHDD_KMHFL_PATH}/${dataRecord.referred_to_facility_code}`,
        type: `Organization`,
        display: dataRecord.referred_to_facility_code
      }
    ],
    reasonCode: extractReasonCode(dataRecord.screening),
    note: extractNotes(dataRecord.supportingInfo)
  };
  return FHITServiceRequest;
};

module.exports = {
  generateFHIRServiceRequest
};
