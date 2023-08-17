require("dotenv/config");

const OPENHIM = {
  username: process.env.OPENHIM_USERNAME || "interop@openhim.org",
  password: process.env.OPENHIM_PASSWORD || "interop-password",
  apiURL: process.env.OPENHIM_API_URL || "https://openhim-core:8080",
  trustSelfSigned: true,
  channel: process.env.OPENHIM_CHANNEL,
};

const FHIR = {
  url: process.env.FHIR_URL,
};

const CHT = {
  url: process.env.CHT_URL,
  username: process.env.CHT_USERNAME,
  password: process.env.CHT_PASSWORD,
};

const CONFIG = {
  port: process.env.PORT || 6000,
};

const KHIS = {
  url: process.env.KHIS_URL,
  username: process.env.KHIS_USERNAME,
  password: process.env.KHIS_PASSWORD,
};

const POSTGRES = {
  host: process.env.POSTGRES_SERVER_URL,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  port: process.env.POSTGRES_PORT,
};

const CLIENT_REGISTRY = {
  url: process.env.CLIENT_REGISTRY_URL,
};

const NHDD = {
  url: process.env.NHDD_URL,
};

const SNOMED_CT = {
  url: process.env.SNOMED_CT_URL,
};

const MEDIATOR = {
  url: process.env.MEDIATOR_URL,
  username: process.env.MEDIATOR_USERNAME,
  password: process.env.MEDIATOR_PASSWORD,
};

module.exports = {
  OPENHIM,
  FHIR,
  CHT,
  CONFIG,
  KHIS,
  POSTGRES,
  CLIENT_REGISTRY,
  NHDD,
  SNOMED_CT,
  MEDIATOR,
};
