const request = require("supertest");
const index = require("../index");
const sinon = require("sinon");

const generateRandomPayload = require("./utils/randomPayload");
const existingPayload = require("./utils/existingPayload");

const post = sinon.stub();
const put = sinon.stub();
const get = sinon.stub();

const randomPayload = generateRandomPayload();
describe("Get /", () => {
  test("Test if server is running and accepting Requests - should respond with a 200 status code", async () => {
    request(index)
      .get("/")
      .send()
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});

describe("Post to /client", () => {
  beforeEach(() => {
    //setting up initial user can modify within the unit tests and default to this after each of the tests
    echisClient = {
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
    };

    existingClient = {
      clientNumber: "MOHR13K16YL12",
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
    };
  });

  afterEach(() => {
    sinon.reset();
  });
  post.resolves({
    status: 200,
    statusText: "OK",
  });

  get.resolves({
    data: {
      clientExists: true,
      client: existingClient,
    },
  });

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
  test("Posting Already Existing client should respond with a UPI Like string", async () => {
    const response = await request(index).post("/client").send(existingPayload);
    expect(response.text.length).toBeLessThanOrEqual(15);
    expect(response.text).toMatch(/^MOH/);
  });
});
describe("Post to /client", () => {
  test("Posting Already Existing client respond with a UPI Like String", async () => {
    const response = await request(index).post("/client").send(existingPayload);
    expect(response.text.length).toBeLessThanOrEqual(15);
    expect(response.text).toMatch(/^MOH/);
  });
});
describe("Post to /client", () => {
  test(`${randomPayload.testString}`, async () => {
    const response = await request(index)
      .post("/client")
      .send(randomPayload.payload);
    expect(response.text.length).toBeLessThanOrEqual(15);
    expect(response.text).toMatch(/^MOH/);
  });
});
describe("/Post to /client", () => {
  test("Posting to client with wrong payload", async () => {
    const response = await request(index).post("/client").send({
      test: "This is a test payload",
    });
    expect(response.text.length).toBeGreaterThan(15);
    expect(response.statusCode).toBe(400);
    expect(response).toHaveProperty("error");
  });
});
