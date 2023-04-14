const { faker } = require("@faker-js/faker");
const existingPayload = {
  firstName: faker.name.firstName(),
  middleName: faker.name.lastName(),
  lastName: faker.name.lastName(),
  dateOfBirth: faker.date.past().toISOString(),
  gender: faker.helpers.arrayElement([
    "male",
    "female",
    "unspecified",
    "intersex",
  ]),
  country: faker.address.countryCode(),
  countyOfBirth: faker.address.zipCode(),
  isAlive: faker.helpers.arrayElement([true, false]),
  originFacilityKmflCode: faker.random.alphaNumeric(5),
  residence: {
    county: "042",
    subCounty: "kisumu-central",
    ward: "kondele",
    village: faker.address.street(),
    landMark: faker.address.street(),
    address: faker.address.streetAddress(),
  },
  identifications: {
    identificationType: "national_id",
    identificationNumber: "987654324",
  },
  contact: {
    primaryPhone: faker.phone.number(),
    secondaryPhone: faker.phone.number(),
    emailAddress: faker.internet.email(),
  },
  nextOfKin: {
    name: faker.name.fullName(),
    relationship: faker.helpers.arrayElement([
      "aunt",
      "uncle",
      "sibling",
      "mother",
      "father",
    ]),
    residence: faker.address.streetAddress(),
    contact: {
      primaryPhone: faker.phone.number(),
      secondaryPhone: faker.phone.number(),
      emailAddress: faker.internet.email(),
    },
  },
};
module.exports = existingPayload;
