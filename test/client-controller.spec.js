const { expect, assert } = require("chai");
const sinon = require("sinon");
const rewire = require("rewire");

//https://www.npmjs.com/package/rewire
const searchClientByIdType = rewire("../src/controllers/client");

const post = sinon.stub();
const put = sinon.stub();
const get = sinon.stub();

searchClientByIdType.__set__("axiosInstance", {
  defaults: {
    headers: {},
  },
  post,
  put,
  get,
});

let existingClient, echisClient;

const runApplication = async () => {
  return await searchClientByIdType(echisClient);
};

describe("Client Registry client creation", () => {
  beforeEach(() => {
    //setting up initial user can modify within the unit tests and default to this after each of the tests
    echisClient = {
      _id: "test",
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

  it("should create unexistent user", async () => {
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

    const result = await runApplication(echisClient);
    console.log(result);
    expect(result).to.have.string("MOH");
    sinon.assert.calledOnce(get);
    //sinon.assert.calledOnce(post);
  });

  it("should not create if user exists", async () => {
    await runApplication();
    //assertions
  });
});
