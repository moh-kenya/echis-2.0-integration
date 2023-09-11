const {
    NHDD,
} = require("../../config");

const NHDD_URL = `${NHDD.url}/orgs/MOH-KENYA/sources`;
const NHDD_GENERIC_PATH = `${NHDD_URL}/nhdd/concepts/`;

const clinicCodes = {
    child_welfare: {
        system: NHDD_GENERIC_PATH,
        code: `54085`,
        display: `Child Welfare Clinic`,
    }
}

const codes = {
    none: {
        system: NHDD_GENERIC_PATH,
        code: `48590`,
        display: `None`,
    },
    bcg: {
        system: NHDD_GENERIC_PATH,
        code: "10512",
        display: "BCG Vaccine",
    },
    opv: {
        system: NHDD_GENERIC_PATH,
        code: "6032",
        display: "Polio Vaccination, Oral",
    },
    pcv: {
        system: NHDD_GENERIC_PATH,
        code: "24499",
        display: "Decavalent Pneumococcal Vaccine (Pneumococcal Conjugate Vaccine)",
    },
    penta: {
        system: NHDD_GENERIC_PATH,
        code: "14676",
        display: "Diphtheria Toxoid / Hepatitis B Vaccines / Pertussis, Acellular / Tetanus Toxoid / Haemophilus Capsular Oligosaccharide",
    },
    ipv: {
        system: NHDD_GENERIC_PATH,
        code: "555",
        display: "Polio vaccine (IPV) Multi dose vial Injection",
    },
    rota: {
        system: NHDD_GENERIC_PATH,
        code: "2760",
        display: "Rotavirus Vaccines",
    },
    vitamin_a: {
        system: NHDD_GENERIC_PATH,
        code: "1107",
        display: "Vitamin A",
    },
    measles: {
        system: NHDD_GENERIC_PATH,
        code: "5456",
        display: "Measles Vaccine",
    },
    //part of 25030 Developmental milestones
    socialSmile: {
        system: NHDD_GENERIC_PATH,
        code: "25055",
        display: "Social smile",
    },
    holdsHeadUp: {
        system: NHDD_GENERIC_PATH,
        code: "25053",
        display: "Holds head up",
    },
    turnsTowardSound: {
        system: NHDD_GENERIC_PATH,
        code: "25051",
        display: "Turns toward source of sound",
    },
    extendHandToGraspObject: {
        system: NHDD_GENERIC_PATH,
        code: "25049",
        display: "Extends hand to grasp an object",
    },
    sitUpright: {
        system: NHDD_GENERIC_PATH,
        code: "25045",
        display: "Able to sit upright",
    },
    standAlone: {
        system: NHDD_GENERIC_PATH,
        code: "25043",
        display: "Able to stand alone",
    },
    walkIndependently: {
        system: NHDD_GENERIC_PATH,
        code: "25042",
        display: "Able to walk independently",
    },
    speaksSeveralWords: {
        system: NHDD_GENERIC_PATH,
        code: "25047",
        display: "Speaks several words",
    },
};

const vaccinesMapping = {
    bcg: codes.bcg,
    opv_0: codes.opv,
    opv_1: codes.opv,
    opv_2: codes.opv,
    opv_3: codes.opv,
    pcv_1: codes.pcv,
    pcv_2: codes.pcv,
    pcv_3: codes.pcv,
    penta_1: codes.penta,
    penta_2: codes.penta,
    penta_3: codes.penta,
    ipv: codes.ipv,
    rota_1: codes.rota,
    rota_2: codes.rota,
    rota_3: codes.rota,
    vitamin_a: codes.vitamin_a,
    measles_9_months: codes.measles,
    measles_18_months: codes.measles,
};

const vitaminAMapping = {
    vitamin_a_6_months: codes.vitamin_a,
    vitamin_a_12_months: codes.vitamin_a,
    vitamin_a_18_months: codes.vitamin_a,
    vitamin_a_24_months: codes.vitamin_a,
    vitamin_a_30_months: codes.vitamin_a,
    vitamin_a_36_months: codes.vitamin_a,
    vitamin_a_42_months: codes.vitamin_a,
    vitamin_a_48_months: codes.vitamin_a,
    vitamin_a_54_months: codes.vitamin_a,
    vitamin_a_60_months: codes.vitamin_a,
};

const developmentalMilestones = {
    social_smile: codes.socialSmile,
    head_handling_and_control: codes.holdsHeadUp,
    turns_towards_the_origin_of_sound: codes.turnsTowardSound,
    extend_hand_to_grasp_a_toy: codes.extendHandToGraspObject,
    sitting: codes.sitUpright,
    standing: codes.standAlone,
    walking: codes.walkIndependently,
    talking: codes.speaksSeveralWords,
    none: codes.none
};

const serviceMapping = {
    immunization_service: {
        clinic: clinicCodes.child_welfare,
        mapping: {
            ...vaccinesMapping,
            ...developmentalMilestones,
            ...vitaminAMapping
        }
    }
}

module.exports = {
    serviceMapping,
};