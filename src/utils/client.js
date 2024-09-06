const { logger } = require("../utils/logger");
const { distance } = require("fastest-levenshtein");

const counties = [
  { code: 1, name: "Mombasa" },
  { code: 2, name: "Kwale" },
  { code: 3, name: "Kilifi" },
  { code: 4, name: "Tana River" },
  { code: 5, name: "Lamu" },
  { code: 6, name: "Taita Taveta" },
  { code: 7, name: "Garissa" },
  { code: 8, name: "wajir" },
  { code: 9, name: "Mandera" },
  { code: 10, name: "Marsabit" },
  { code: 11, name: "Isiolo" },
  { code: 12, name: "Meru" },
  { code: 13, name: "Tharaka Nithi" },
  { code: 14, name: "Embu" },
  { code: 15, name: "Kitui" },
  { code: 16, name: "Machakos" },
  { code: 17, name: "Makueni" },
  { code: 18, name: "Nyandarua" },
  { code: 19, name: "Nyeri" },
  { code: 20, name: "Kirinyaga" },
  { code: 21, name: "Murang'a" },
  { code: 22, name: "Kiambu" },
  { code: 23, name: "Turkana" },
  { code: 24, name: "West Pokot" },
  { code: 25, name: "Samburu" },
  { code: 26, name: "Trans Nzoia" },
  { code: 27, name: "Uasin Gishu" },
  { code: 28, name: "Elgeyo Marakwet" },
  { code: 29, name: "Nandi" },
  { code: 30, name: "Baringo" },
  { code: 31, name: "Laikipia" },
  { code: 32, name: "Nakuru" },
  { code: 33, name: "Narok" },
  { code: 34, name: "Kajiado" },
  { code: 35, name: "Kericho" },
  { code: 36, name: "Bomet" },
  { code: 37, name: "Kakamega" },
  { code: 38, name: "Vihiga" },
  { code: 39, name: "Bungoma" },
  { code: 40, name: "Busia" },
  { code: 41, name: "Siaya" },
  { code: 42, name: "Kisumu" },
  { code: 43, name: "Homa Bay" },
  { code: 44, name: "Migori" },
  { code: 45, name: "Kisii" },
  { code: 46, name: "Nyamira" },
  { code: 47, name: "Nairobi" },
];

const supportedIDTypes = {
  national_id: "national-id",
  birth_certificate: "birth-certificate",
  passport: "passport",
  alien_card: "alien-id",
};

const getIdentificationType = (idType) => {
  if (idType in supportedIDTypes) {
    return supportedIDTypes[idType];
  }
  return idType;
};


const generateClientRegistryPayload = (echisDoc) => {
  const nameArray = echisDoc.name.split(" ");
  let result = {
    firstName: echisDoc.first_name || nameArray.at(0),
    middleName: echisDoc.middle_name || nameArray.at(1),
    lastName: echisDoc.last_name || nameArray.at(2),
    dateOfBirth: echisDoc.date_of_birth,
    maritalStatus: echisDoc.marital_status || "",
    gender: echisDoc.sex,
    occupation: echisDoc.occupation || "",
    religion: echisDoc.religion || "",
    educationLevel: echisDoc.education_level || "",
    country: echisDoc.nationality || "KE",
    countyOfBirth: echisDoc?.country_of_birth || "county-n-a",
    isAlive: true,
    originFacilityKmflCode:
      echisDoc.parent?.parent?.link_facility_code || "",
    residence: {
      county:
        transformCountyCode(echisDoc.county_of_residence) ||
        transformCountyCode(
          `${counties.find(
            (county) =>
              county.name ===
              echisDoc.parent?.parent?.parent?.parent?.parent?.name
                .trim()
                .replace("County", "")
          ).code
          }`
        ),
      subCounty:
        echisDoc.subcounty ||
        echisDoc.parent?.parent?.parent?.name
          .trim()
          .replaceAll(" ", "-")
          .toLowerCase(),
      ward: echisDoc.ward || "",
      village: echisDoc.village || "",
      landMark: echisDoc.land_mark || "",
      address: echisDoc.address || "",
    },
    identifications: [
      {
        countryCode: echisDoc.country_code || "KE",
        identificationType:
          supportedIDTypes[echisDoc.identification_type] || "national-id",
        identificationNumber: echisDoc.identification_number,
      },
    ],
    contact: {
      primaryPhone: echisDoc.phone,
      secondaryPhone: echisDoc.alternate_phone,
      emailAddress: echisDoc.email_address || "",
    },
    nextOfKins: [
      {
        name: echisDoc.next_of_kin || echisDoc.parent.contact.name,
        relationship:
          echisDoc.relationship_with_next_of_kin ||
          echisDoc.relationship_to_hh_head,
        residence: echisDoc.next_of_kin_residence,
        contact: {
          primaryPhone:
            echisDoc.next_of_kin_phone ||
            echisDoc.parent.contact.phone,
          secondaryPhone:
            echisDoc.next_of_kin_alternate_phone ||
            echisDoc.parent.contact.alternate_phone,
          emailAddress:
            echisDoc.next_of_kin_email ||
            echisDoc.parent.contact.email_address ||
            "",
        },
      },
    ],
  };
  return result;
};

const transformCountyCode = (code) => {
  return code ? code.padStart(3, "0") : "county-n-a";
};

const getPropByString = (obj, propString) => propString.split('.').reduce((prev, fieldName) => {
  if (prev === undefined) { return undefined; }
  return prev[fieldName];
}, obj);

function areSimilar(contactName, clientName) {
  return distance(contactName, clientName) / Math.max(contactName.length, clientName.length) < 0.3;
}

function areNamesSimilar(contact, client) {
  const contactName = contact.first_name
    .concat(" ", contact.middle_name ?? "", " ", contact.last_name ?? "")
    .trim()
    .toLowerCase();
  const clientName = client.firstName
    .concat(" ", client.middleName ?? "", " ", client.lastName ?? "")
    .trim()
    .toLowerCase();
  return areSimilar(contactName, clientName);
}

// compare fields in the echis client doc and the client doc we got from Client Registry
function getMismatchedClientFields(echisClientDoc, crClientDoc) {
  const matcherFields = ["gender", "dateOfBirth"];
  if (!areNamesSimilar(echisClientDoc, crClientDoc)) {
    matcherFields.push("firstName", "middleName", "lastName");
  }
  const mismatchedFields = {};
  // the payload we generate here has the same format as what we get back when we query for client existence
  const crPayload = generateClientRegistryPayload(echisClientDoc);
  matcherFields.forEach((key) => {
    const actual = getPropByString(crPayload, key);
    const expected = getPropByString(crClientDoc, key);
    if (!expected) {
      // we only compare if we have a value from the client registry
      return;
    }
    if (!actual || actual.toUpperCase() !== expected.toUpperCase()) {
      mismatchedFields[key] = { actual: actual, expected: expected };
    }
  });
  return mismatchedFields;
}

module.exports = {
  getIdentificationType,
  areSimilar,
  supportedIDTypes,
  generateClientRegistryPayload,
  getMismatchedClientFields,
};
