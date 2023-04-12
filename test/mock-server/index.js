const express = require("express");
const { faker } = require("@faker-js/faker");

const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/clientRegistry/", (req, res) => {
  const mockedResponse = {
    clientExists: true,
    client: {
      clientNumber: "MOH" + faker.random.alphaNumeric(10).toUpperCase(),
      firstName: faker.name.firstName(),
      middleName: faker.name.lastName(),
      lastName: faker.name.lastName(),
      dateOfBirth: faker.date.past().toISOString(),
      maritalStatus: faker.helpers.arrayElement([
        "single",
        "married",
        "divorced",
      ]),
      gender: faker.helpers.arrayElement([
        "male",
        "female",
        "unspecified",
        "intersex",
      ]),
      occupation: faker.name.jobTitle(),
      religion: faker.helpers.arrayElement(["christian", "muslim", "hindu"]),
      educationLevel: faker.helpers.arrayElement([
        "primary",
        "secondary",
        "college",
        "master's",
        "doctorate",
      ]),
      country: faker.address.countryCode(),
      countyOfBirth: faker.address.zipCode(),
      isAlive: faker.datatype.boolean(),
      originFacilityKmflCode: faker.random.alphaNumeric(5),
      isOnART: faker.datatype.boolean(),
      nascopCCCNumber: null,
      residence: {
        county: faker.address.zipCode(),
        subCounty: faker.address.city(),
        ward: faker.address.street(),
        village: faker.address.street(),
        landMark: faker.address.street(),
        address: faker.address.streetAddress(),
      },
      identifications: [
        {
          countryCode: faker.address.countryCode(),
          identificationType: faker.helpers.arrayElement([
            "national-id",
            "passport",
            "driver-license",
          ]),
          identificationNumber: faker.random.alphaNumeric(10),
        },
      ],
      contact: {
        primaryPhone: faker.phone.number(),
        secondaryPhone: faker.phone.number(),
        emailAddress: faker.internet.email(),
      },
      nextOfKins: [
        {
          name: faker.name.findName(),
          relationship: faker.helpers.arrayElement([
            "spouse",
            "parent",
            "sibling",
            "child",
          ]),
          residence: faker.address.streetAddress(),
          contact: {
            primaryPhone: faker.phone.number(),
            secondaryPhone: faker.phone.number(),
            emailAddress: faker.internet.email(),
          },
        },
      ],
    },
  };

  res.json(mockedResponse);
});
app.post("/api/clientRegistry/", (req, res) => {
  let mockedResponse = "";
  if (req.body.identifications.identificationNumber === "test") {
    mockedResponse = {
      errors: {
        "identifications[0]": [
          "The specified ID type and number has been used by another client.",
        ],
      },
      type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
      title: "One or more validation errors occurred.",
      status: 400,
    };
    res.status(400).json(mockedResponse);
  } else {
    mockedResponse = {
      clientNumber: "MOH" + faker.random.alphaNumeric(10).toUpperCase(),
      firstName: faker.name.firstName(),
      middleName: faker.name.lastName(),
      lastName: faker.name.lastName(),
      dateOfBirth: faker.date.past().toISOString(),
      maritalStatus: faker.helpers.arrayElement([
        "single",
        "married",
        "divorced",
      ]),
      gender: faker.helpers.arrayElement([
        "male",
        "female",
        "unspecified",
        "intersex",
      ]),
      occupation: faker.name.jobTitle(),
      religion: faker.helpers.arrayElement(["christian", "muslim", "hindu"]),
      educationLevel: faker.helpers.arrayElement([
        "primary",
        "secondary",
        "college",
        "master's",
        "doctorate",
      ]),
      country: faker.address.countryCode(),
      countyOfBirth: faker.address.zipCode(),
      isAlive: faker.datatype.boolean(),
      originFacilityKmflCode: faker.random.alphaNumeric(5),
      isOnART: faker.datatype.boolean(),
      nascopCCCNumber: null,
      residence: {
        county: faker.address.zipCode(),
        subCounty: faker.address.city(),
        ward: faker.address.street(),
        village: faker.address.street(),
        landMark: faker.address.street(),
        address: faker.address.streetAddress(),
      },
      identifications: [
        {
          countryCode: faker.address.countryCode(),
          identificationType: faker.helpers.arrayElement([
            "national-id",
            "passport",
            "driver-license",
          ]),
          identificationNumber: faker.random.alphaNumeric(10),
        },
      ],
      contact: {
        primaryPhone: faker.phone.number(),
        secondaryPhone: faker.phone.number(),
        emailAddress: faker.internet.email(),
      },
      nextOfKins: [
        {
          name: faker.name.findName(),
          relationship: faker.helpers.arrayElement([
            "spouse",
            "parent",
            "sibling",
            "child",
          ]),
          residence: faker.address.streetAddress(),
          contact: {
            primaryPhone: faker.phone.number(),
            secondaryPhone: faker.phone.number(),
            emailAddress: faker.internet.email(),
          },
        },
      ],
    };
    res.json(mockedResponse);
  }
});
app.post("/api/oauth/token/", (req, res) => {
  // Generate the access token
  const accessToken = generateAccessToken();

  // Create the response object
  const response = {
    access_token: accessToken,
    expires_in: 86400,
    token_type: "Bearer",
    scope: "DHP.Gateway DHP.Partners",
  };

  // Send the response as JSON
  res.json(response);
});
// Function to generate the access token
function generateAccessToken() {
  // Generate a random string of characters
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 843; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

app.listen(3000, () => {
  console.log("Mock server is running on port 3000...");
});
