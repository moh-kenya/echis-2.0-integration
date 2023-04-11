const request = require("supertest");
const index = require("../index");
const generateRandomPayload = require("./utils/randomPayload");

const randomPayload = generateRandomPayload();

describe("Get /", () => {
  test("should respond with a 200 status code", async () => {
    request(index)
      .get("/")
      .send()
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});

describe("Post to /client", () => {
  test("Posting Already Existing client should respond with a 200 status code", async () => {
    const response = await request(index)
      .post("/client")
      .send({
        firstName: "kfjkf",
        lastName: "ksdnvok",
        dateOfBirth: "1991-06-07",
        gender: "male",
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
          identificationType: "national_id",
          identificationNumber: "987654324",
        },
        isAlive: true,
        originFacilityKmflCode: "701583",
      });
    expect(response.statusCode).toBe(200);
  });
});
describe("Post to /client", () => {
  test("Posting Already Existing client respond with a UPI Like String", async () => {
    const response = await request(index)
      .post("/client")
      .send({
        firstName: "kfjkf",
        lastName: "ksdnvok",
        dateOfBirth: "1991-06-07",
        gender: "male",
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
          identificationType: "national_id",
          identificationNumber: "987654324",
        },
        isAlive: true,
        originFacilityKmflCode: "701583",
      });

    expect(response.text.length).toBeCloseTo(13);
  });
});

describe("Post to /client", () => {
  test(`${randomPayload.testString}`, async () => {
    const response = await request(index)
      .post("/client")
      .send(randomPayload.payload);
    expect(response.text.length).toBeCloseTo(13);
  });
});
