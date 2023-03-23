const getIdInfoFromEchisPayload = async (echisDoc) => {
  return {
    identificationType: "alien-id",
    identificationNumber: "TESTZA12345",
  };
};

const generateEchisUpdatePayload = async (echisDoc, clientNumber) => {
  return JSON.stringify({
    _id: echisDoc._id,
    _rev: echisDoc._rev,
    upi: clientNumber,
  });
};

const idMap = {
  national_id: "national-id",
  birth_certificate: "birth-certificate",
  passport: "passport",
  alien_card: "alien-id"
};

const generateClientRegistryPayload = async (echisDoc) => {
  let result = {
    firstName: echisDoc.firstName,
    middleName: echisDoc.middleName || "",
    lastName: echisDoc.lastName,
    dateOfBirth: echisDoc.dateOfBirth,
    maritalStatus: echisDoc.maritalStatus || "",
    gender: echisDoc.gender,
    occupation: echisDoc.occupation || "",
    religion: echisDoc.religion || "",
    educationLevel: echisDoc.educationLevel || "",
    country: echisDoc.country,
    countyOfBirth: echisDoc.countyOfBirth,
    isAlive: echisDoc.isAlive || true,
    originFacilityKmflCode: echisDoc.originFacilityKmflCode || "",
    residence: {
      county: echisDoc.residence.county,
      subCounty: echisDoc.residence.subCounty,
      ward: echisDoc.residence.ward || "",
      village: echisDoc.residence.village || "",
      landMark: echisDoc.residence.landMark || "",
      address: echisDoc.residence.address || "",
    },
    identifications: [
      {
        countryCode: echisDoc.identification.countryCode || "",
        identificationType: idMap[echisDoc.identification.identificationType],
        identificationNumber: echisDoc.identificationNumber,
      },
    ],
    contact: {
      primaryPhone: echisDoc.contact.primaryPhone,
      secondaryPhone: echisDoc.contact.secondaryPhone,
      emailAddress: echisDoc.contact.emailAddress || "",
    },
    nextOfKins: [
      {
        name: echisDoc.nextOfKin.name,
        relationship: echisDoc.nextOfKin.relationship,
        residence: echisDoc.nextOfKin.residence,
        contact: {
          primaryPhone: echisDoc.nextOfKin.contact.primaryPhone,
        },
      },
    ],
  };
  return result;
};

module.exports = {
  getIdInfoFromEchisPayload,
  generateEchisUpdatePayload,
  generateClientRegistryPayload,
};
