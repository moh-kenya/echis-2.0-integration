require('dotenv/config');

const OPENHIM = {
  username: process.env.OPENHIM_USERNAME || 'interop@openhim.org',
  password: process.env.OPENHIM_PASSWORD || 'interop-password',
  apiURL: process.env.OPENHIM_API_URL || 'https://openhim-core:8080',
  trustSelfSigned: true,
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
  port: process.env.PORT || 6000
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

module.exports = {
  OPENHIM,
  FHIR,
  CHT,
  CONFIG,
  CLIENT_REGISTRY,
  NHDD,
  SNOMED_CT
};
