
const { faker } = require('@faker-js/faker');

const generateDiabetesPayload = (echisDoc) => {
    const {fields}= echisDoc.doc;
    const nameArray = fields.patient_name?.split(" ");
    let result = {
      gender: capitalizeFirstLetter(fields.patient_sex),
      bioData: {
        firstName: fields.first_name || nameArray.at(0),
        lastName: fields.last_name || nameArray.at(2),
        country: 1,
        levelOfEducation: "A-level Completed",
        phoneNumber: "198765432",
        occupation: "Employed",
        nationalId: faker.finance.account(),
        initial: "E",
        county: 2,
        subCounty: 3,
        insuranceStatus: false,
        phoneNumberCategory: "Personal"
      },
      patientStatus: {
        htnPatientType: "N/A",
        diabetesPatientType: "N/A",
        isHtnDiagnosis: false,
        isDiabetesDiagnosis: false
    },
    isRegularSmoker: false,
    cvdRiskScore: 2,
    dateOfBirth: fields.patient_date_of_birth+"T00:00:00+03:00",
    bpLog: {
        avgSystolic: 88,
        weight: fields.weight,
        avgDiastolic: 88,
        avgBloodPressure: "88/88",
        height: fields.height,
        bpLogDetails: [
            {
                diastolic: 88,
                pulse: 88,
                systolic: 88
            },
            {
                diastolic: 88,
                pulse: 88,
                systolic: 88
            },
            {
                diastolic: 88,
                pulse: 88,
                systolic: 88
            }
        ],
        bmi: fields.BMI
    },
    phq4: {
        phq4Score: 7,
        phq4MentalHealth: [
            {
                answerId: 67,
                score: 3,
                questionId: 6,
                displayOrder: 4
            },
        ],
        phq4RiskLevel: "Moderate"
    },
    cvdRiskLevel: "Low risk",
    unitMeasurement: "metric",
    cvdRiskScoreDisplay: "2% - Low risk",
    bioMetrics: {
        gender: "Male",
        isRegularSmoker: false,
        age: Number(fields.patient_age_in_years),
    },
    glucoseLog: {
        glucoseUnit: "mmol/L",
        hba1cUnit: "mmol/L"
    },
    age: Number(fields.patient_age_in_years),
    siteId: 1,
    };
    return result;
  };

const capitalizeFirstLetter=(str)=>{
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    generateDiabetesPayload
};