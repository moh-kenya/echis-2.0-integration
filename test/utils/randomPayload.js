const generateRandomString = require("./randomString");
const getIdentifier = require("./randomIdentifier");
const getGender = require("./randomGender");
const generateRandomPayload = () => {
  let id = generateRandomString(10);
  let identifier = getIdentifier();
  let gender = getGender();
  let payload = {
    firstName: "kfjkf",
    lastName: "ksdnvok",
    dateOfBirth: "1991-06-07",
    gender: gender,
    country: "KE",
    countyOfBirth: "042",
    residence: {
      county: "044",
      subCounty: "rongo",
      village: "south-kamagambo",
      landMark: "ngere",
      address: "ngere",
    },
    contact: {
      primaryPhone: "+254789345678",
      secondaryPhone: "",
    },
    nextOfKin: {
      name: "John Doe",
      relationship: "uncle",
      residence: "Nairobi",
      contact: {
        primaryPhone: "+254700111111",
        secondaryPhone: "+254700111111",
        emailAddress: "hello.world@gmail.com",
      },
    },
    identifications: {
      identificationType: identifier,
      identificationNumber: id,
    },
    isAlive: true,
    originFacilityKmflCode: "701583",
  };
  let testString = `Posting Non Existing client respond with a UPI Like String, payload:${JSON.stringify(
    payload
  )}`;
  return {
    payload: payload,
    testString: testString,
  };
};

module.exports = generateRandomPayload;
