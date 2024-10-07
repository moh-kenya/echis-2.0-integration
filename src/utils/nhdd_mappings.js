const { NHDD } = require("../../config");

const NHDD_URL = `${NHDD.url}/orgs/MOH-KENYA/sources`;
const NHDD_GENERIC_PATH = `${NHDD_URL}/nhdd/concepts/`;

const clinicCodes = {
    child_welfare: {
        system: NHDD_GENERIC_PATH,
        code: `54085`,
        display: `Child Welfare Clinic`,
    },
    outPatient: {
        system: NHDD_GENERIC_PATH,
        code: `28023`,
        display: `Outpatient Department`,
    },
};

const codes = {
    none: {
        system: NHDD_GENERIC_PATH,
        code: "260413007",
        display: `None`,
    },
    bcg: {
        system: NHDD_GENERIC_PATH,
        code: "1861000221106",
        display: "BCG Vaccine",
    },
    opv: {
        system: NHDD_GENERIC_PATH,
        code: "1051000221104",
        display: "Polio Vaccination, Oral",
    },
    pcv: {
        system: NHDD_GENERIC_PATH,
        code: "981000221107",
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
        code: "82622003",
        display: "Vitamin A",
    },
    measles: {
        system: NHDD_GENERIC_PATH,
        code: "871765008",
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
    // treatment followup
    better: {
        system: NHDD_GENERIC_PATH,
        code: "23831",
        display: "Better",
    },
    worse: {
        system: NHDD_GENERIC_PATH,
        code: "28847",
        display: "Deterioration",
    },
    noChange: {
        system: NHDD_GENERIC_PATH,
        code: "28849",
        display: "No progress",
    },
    consitpation: {
        system: NHDD_GENERIC_PATH,
        code: "14760008",
        display: "Constipation",
    },
    skinRash: {
        system: NHDD_GENERIC_PATH,
        code: "703938007",
        display: "Dermatitis",
    },
    diarrhea: {
        system: NHDD_GENERIC_PATH,
        code: "62315008",
        display: "Diarrhea",
    },
    dizziness: {
        system: NHDD_GENERIC_PATH,
        code: "404640003",
        display: "Dizziness",
    },
    drowsiness: {
        system: NHDD_GENERIC_PATH,
        code: "271782001",
        display: "Drowsy",
    },
    dryMouth: {
        system: NHDD_GENERIC_PATH,
        code: "87715008",
        display: "dry mouth",
    },
    fatigue: {
        system: NHDD_GENERIC_PATH,
        code: "84229001",
        display: "Fatigue",
    },
    headache: {
        system: NHDD_GENERIC_PATH,
        code: "25064002",
        display: "Headache",
    },
    hives: {
        system: NHDD_GENERIC_PATH,
        code: "247472004",
        display: "Hives",
    },
    insomnia: {
        system: NHDD_GENERIC_PATH,
        code: "193462001",
        display: "Insomnia",
    },
    irregularHeartbeat: {
        system: NHDD_GENERIC_PATH,
        code: "361137007",
        display: "Irregular Heartbeat",
    },
    nausea: {
        system: NHDD_GENERIC_PATH,
        code: "422587007",
        display: "Nausea",
    },
    upsetStomach: {
        system: NHDD_GENERIC_PATH,
        code: "95516005",
        display: "Upset Stomach",
    },
    rash: {
        system: NHDD_GENERIC_PATH,
        code: "271807003",
        display: "Rash",
    },
    vomiting: {
        system: NHDD_GENERIC_PATH,
        code: "422400008",
        display: "Vomiting",
    },
    //under 5 assessment
    notFeeding: {
        system: NHDD_GENERIC_PATH,
        code: "72552008",
        display: "Refusal to Feed",
    },
    convulsions: {
        system: NHDD_GENERIC_PATH,
        code: "91175000",
        display: `Convulsions`,
    },
    convulsionsNewborn: {
        system: NHDD_GENERIC_PATH,
        code: `87476004`,
        display: `Convulsions in the newborn`,
    },
    fast_breathing: {
        system: NHDD_GENERIC_PATH,
        code: "271823003",
        display: "Tachypnea",
    },
    chestIndrawn: {
        system: NHDD_GENERIC_PATH,
        code: "247389006", // sus
        display: "Intercostal Recession",
    },
    fever: {
        system: NHDD_GENERIC_PATH,
        code: "386661006",
        display: "Fever",
    },
    lowTemp: {
        system: NHDD_GENERIC_PATH,
        code: "386689009",
        display: "Decreased Body Temperature",
    },
    highTemp: {
        system: NHDD_GENERIC_PATH,
        code: "85623003",
        display: "Body Temperature Above Normal",
    },
    noMovement: {
        system: NHDD_GENERIC_PATH,
        code: "20291",
        display: "No movement when stimulated",
    },
    muacRed: {
        system: NHDD_GENERIC_PATH,
        code: "26926",
        display: "Muac Red Color",
    },
    yellowSoles: {
        system: NHDD_GENERIC_PATH,
        code: "27300",
        display: "Yellow Colored Soles",
    },
    umbilicalStumpBleeding: {
        system: NHDD_GENERIC_PATH,
        code: "34215",
        display: "Umbilical Bleeding",
    },
    localInfection: {
        system: NHDD_GENERIC_PATH,
        code: "14395",
        display: "Local Infection of Wound",
    },
    lowBirthWeight: {
        system: NHDD_GENERIC_PATH,
        code: "276610007",
        display: "Low Birth Weight",
    },
    cough: {
        system: NHDD_GENERIC_PATH,
        code: "49727002",
        display: "Cough",
    },
    bloodInStool: {
        system: NHDD_GENERIC_PATH,
        code: "405729008",
        display: "Hematochezia",
    },
    medication: {
        system: NHDD_GENERIC_PATH,
        code: "182832007",
        display: "Medication",
    },
    unconscious: {
        system: NHDD_GENERIC_PATH,
        code: "418107008",
        display: "Unconscious",
    },
    vomittingEverything: {
        system: NHDD_GENERIC_PATH,
        code: "196746003",
        display: "Vomiting everything",
    },
    swollenFeet: {
        system: NHDD_GENERIC_PATH,
        code: "65124004",
        display: "Swollen Feet",
    },
    malariaConfirmed: {
        system: NHDD_GENERIC_PATH,
        code: "61462000",
        display: "Malaria, confirmed",
    },
    //over 5 assessment
    injuries: {
        system: NHDD_GENERIC_PATH,
        code: "17508",
        display: "Multiple Wounds",
    },
    difficultyBreathing: {
        system: NHDD_GENERIC_PATH,
        code: "267036007",
        display: "Dyspnea",
    },
    fainting: {
        system: NHDD_GENERIC_PATH,
        code: "271594007",
        display: "Fainting Spells",
    },
    burns: {
        system: NHDD_GENERIC_PATH,
        code: "50288",
        display: "Burns",
    },
    tbContact: {
        system: NHDD_GENERIC_PATH,
        code: "56717001",
        display: "Tuberculosis",
    },
    chestPain: {
        system: NHDD_GENERIC_PATH,
        code: "29857009",
        display: "Chest pain",
    },
    weightLoss: {
        system: NHDD_GENERIC_PATH,
        code: "262285001",
        display: "Weight loss",
    },
    nightSweats: {
        system: NHDD_GENERIC_PATH,
        code: "42984000",
        display: "Night sweats",
    },
    fatigue: {
        system: NHDD_GENERIC_PATH,
        code: "84229001",
        display: "Fatigue",
    },
    diabetic: {
        system: NHDD_GENERIC_PATH,
        code: "302866003",
        display: "Diabetic Hypoglycemia",
    },
    excessThirst: {
        system: NHDD_GENERIC_PATH,
        code: "249477003",
        display: "Excessive Thirst",
    },
    frequentUrination: {
        system: NHDD_GENERIC_PATH,
        code: "162116003",
        display: "Increased Frequency of Urination",
    },
    weightChange: {
        system: NHDD_GENERIC_PATH,
        code: "301336003",
        display: "Weight change",
    },
    hypertensive: {
        system: NHDD_GENERIC_PATH,
        code: "38341003",
        display: "Hypertensive Disorder",
    },
    severeHeadache: {
        system: NHDD_GENERIC_PATH,
        code: "25064002",
        display: "Severe Headache",
    },
    noseBleed: {
        system: NHDD_GENERIC_PATH,
        code: "249366005",
        display: "Nosebleed, Symptom",
    },
    tired: {
        system: NHDD_GENERIC_PATH,
        code: "224960004",
        display: "Tired",
    },
    fastHeartbeat: {
        system: NHDD_GENERIC_PATH,
        code: "3424008",
        display: "Very Rapid Heartbeat",
    },
    lackOfSleep: {
        system: NHDD_GENERIC_PATH,
        code: `301345002`,
        display: `Lack of sleep`,
    },
    feelingOfWorthlessness: {
        system: NHDD_GENERIC_PATH,
        code: `247892001`,
        display: `Feeling of worthlessness`,
    },
    stayingAwayFromPeople: {
        system: NHDD_GENERIC_PATH,
        code: `29644`,
        display: `Staying away from people`,
    },
    tearfulness: {
        system: NHDD_GENERIC_PATH,
        code: `271951008`,
        display: `Tearfulness`,
    },
    lackOfHygiene: {
        system: NHDD_GENERIC_PATH,
        code: `41667`,
        display: `Lack of hygiene`,
    },
    anxiety: {
        system: NHDD_GENERIC_PATH,
        code: `48694002`,
        display: `Anxiety/worried for no apparent reason`,
    },
    irritability: {
        system: NHDD_GENERIC_PATH,
        code: `55929007`,
        display: `Irritability/agitated`,
    },
    diarrhea: {
        system: NHDD_GENERIC_PATH,
        code: `3792`,
        display: `Diarrhea`,
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
    //u5 assessment
    opv0: codes.opv,
    opv1: codes.opv,
    opv2: codes.opv,
    opv3: codes.opv,
    pcv1: codes.pcv,
    pcv2: codes.pcv,
    pcv3: codes.pcv,
    penta1: codes.penta,
    penta2: codes.penta,
    penta3: codes.penta,
    rota1: codes.rota,
    rota2: codes.rota,
    rota3: codes.rota,
    vit_a: codes.vitamin_a,
    measles_9: codes.measles,
    measles_18: codes.measles,
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
    //u5 assessment
    "6_months": codes.vitamin_a,
    "12_months": codes.vitamin_a,
    "18_months": codes.vitamin_a,
    "24_months": codes.vitamin_a,
    "30_months": codes.vitamin_a,
    "36_months": codes.vitamin_a,
    "42_months": codes.vitamin_a,
    "48_months": codes.vitamin_a,
    "54_months": codes.vitamin_a,
    "60_months": codes.vitamin_a,
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
    none: codes.none,
    //u5 assessment
    grasp_toy: codes.extendHandToGraspObject,
    head_holding: codes.holdsHeadUp,
    turn_to_sound: codes.turnsTowardSound,
};

const treatmentFollowUpSideEffect = {
    constipation: codes.consitpation,
    skin_rash_or_dermatitis: codes.skinRash,
    diarrhea: codes.diarrhea,
    dizziness: codes.dizziness,
    drowsiness: codes.drowsiness,
    dry_mouth: codes.dryMouth,
    fatigue: codes.fatigue,
    headache: codes.headache,
    hives: codes.hives,
    insomnia: codes.insomnia,
    irregular_heartbeat: codes.irregularHeartbeat,
    nausea: codes.nausea,
    upset_stomach: codes.upsetStomach,
    rash: codes.rash,
    vomiting: codes.vomiting,
};

const mentalhealthSigns = {
    lack_of_sleep: codes.lackOfSleep,
    feeling_of_worthlessness: codes.feelingOfWorthlessness,
    staying_away_from_people: codes.stayingAwayFromPeople,
    tearfulness: codes.tearfulness,
};

const observerdMentalhealthSigns = {
    lack_of_hygiene: codes.lackOfHygiene,
    anxiety_worried_for_no_apparent_reason: codes.anxiety,
    irritability_agitated: codes.irritability,
};

const serviceMapping = {
    immunization_service: {
        clinic: clinicCodes.child_welfare,
        mapping: {
            ...vaccinesMapping,
            ...developmentalMilestones,
            ...vitaminAMapping,
        },
    },
    treatment_follow_up: {
        clinic: clinicCodes.outPatient,
        mapping: {
            no_change: codes.noChange,
            feeling_better: codes.better,
            worse: codes.worse,
            ...treatmentFollowUpSideEffect,
        },
    },
    u5_assessment: {
        clinic: clinicCodes.child_welfare,
        mapping: {
            cannot_feed: codes.notFeeding,
            convulsions_newborn: codes.convulsionsNewborn,
            has_fast_breathing: codes.fast_breathing,
            chest_indrawing: codes.chestIndrawn,
            has_fever: codes.fever,
            has_low_temp: codes.lowTemp,
            has_high_temp: codes.highTemp,
            has_taken_al: codes.medication,
            no_movement: codes.noMovement,
            has_yellow_soles: codes.yellowSoles,
            bleeding_umbilical_stump: codes.umbilicalStumpBleeding,
            local_infection_signs: codes.localInfection,
            birth_weight_chart: codes.lowBirthWeight,
            has_cough: codes.cough,
            has_diarrhoea: codes.diarrhea,
            blood_in_stool: codes.bloodInStool,
            convulsions: codes.convulsions,
            cannot_drink_or_feed: codes.notFeeding,
            is_vomiting_everything: codes.vomittingEverything,
            is_sleepy_or_unconscious: codes.unconscious,
            muac_red: codes.muacRed,
            has_swollen_feet: codes.swollenFeet,
            malaria_positive: codes.malariaConfirmed,
            ...developmentalMilestones,
            ...vitaminAMapping,
            ...vaccinesMapping,
        },
    },
    over_five_assessment: {
        clinic: clinicCodes.outPatient,
        mapping: {
            none: codes.none,
            cough_of_any_duration: codes.cough,
            fever: codes.fever,
            diarrhea: codes.diarrhea,
            injuries_and_wounds: codes.injuries,
            convulsions: codes.convulsions,
            fainting: codes.fainting,
            burns: codes.burns,
            tb_contact: codes.tbContact,
            chest_pain: codes.chestPain,
            weight_loss_failure_to_thrive: codes.weightLoss,
            night_sweats: codes.nightSweats,
            fatigue: codes.fatigue,
            blood_in_stool: codes.bloodInStool,
            diabetic: codes.diabetic,
            thirst_or_hunger: codes.excessThirst,
            frequent_urination: codes.frequentUrination,
            weight_changes: codes.weightChange,
            hypertensive: codes.hypertensive,
            dizziness: codes.dizziness,
            severe_headache: codes.severeHeadache,
            nose_bleeding: codes.noseBleed,
            unusual_tiredness: codes.tired,
            fast_heartbeat: codes.fastHeartbeat,
            nausea_vomiting: codes.nausea,
            ...mentalhealthSigns,
            ...observerdMentalhealthSigns,
        },
    },
};

module.exports = {
    serviceMapping,
};
