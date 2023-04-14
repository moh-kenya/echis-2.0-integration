const { expect, assert } = require("chai");
const sinon = require("sinon");
const rewire = require("rewire");

const defaultClient = {
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

const clientController = rewire("../src/controllers/client");

const axiosGetStub = sinon.stub();
const axiosPostStub = sinon.stub();
const echisAxiosGetStub = sinon.stub();
const echisAxiosPutStub = sinon.stub();

clientController.__set__("axiosInstance", {
  get: axiosGetStub,
  post: axiosPostStub,
});

clientController.__set__("echisAxiosInstance", {
  get: echisAxiosGetStub,
  put: echisAxiosPutStub,
});

let newClient, existingClient;

const runApplication = async (client) => {
  return await clientController.searchClientByIdType(client);
};

describe("Client Registry client creation", () => {
  beforeEach(() => {
    newClient = { ...defaultClient, doc_id: "test" };
    existingClient = { ...defaultClient, doc_id: "test", upi: "MOHR13K16YL12" };
    echisDoc = { "_id":"test", "_rev":"test_rev", "name":"Test" }
  });

  afterEach(() => {
    sinon.reset();
  });

  it("should create non-existent user", async () => {
    axiosGetStub.resolves({
      data: {
        clientExists: false,
        client: null,
      },
    });
    
    axiosPostStub.resolves({
      status: 200,
      statusText: "OK",
      data: existingClient
    });
    
    echisAxiosGetStub.resolves({
      data: echisDoc,
    });
    
    echisAxiosPutStub.resolves({
      status: 200,
      statusText: "OK",
      data: { "ok":true, "id":"test", "rev":"test_rev_1"}
    });

    const result = await runApplication(newClient);
    expect(result).to.be.an('object');
    sinon.assert.calledOnce(axiosGetStub);
    sinon.assert.calledOnce(axiosPostStub);
    sinon.assert.calledOnce(echisAxiosGetStub);
    sinon.assert.calledOnce(echisAxiosPutStub);
  });

  it("should not create if user exists", async () => {
    axiosGetStub.resolves({
      data: {
        clientExists: true,
        client: existingClient,
      },
    });

    axiosPostStub.resolves({
      status: 200,
      statusText: "OK",
      data: existingClient
    });

    echisAxiosGetStub.resolves({
      data: echisDoc,
    });

    echisAxiosPutStub.resolves({
      status: 200,
      statusText: "OK",
      data: { "ok":true, "id":"test", "rev":"test_rev_1"}
    });
    await runApplication(existingClient);
    sinon.assert.calledOnce(axiosGetStub);
    sinon.assert.notCalled(axiosPostStub);
    sinon.assert.calledOnce(echisAxiosGetStub);
    sinon.assert.calledOnce(echisAxiosPutStub);
  });
});
