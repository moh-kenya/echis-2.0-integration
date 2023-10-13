const { logger } = require("./src/utils/logger");

require("dotenv/config");

const OPENHIM = {
  username: process.env.OPENHIM_USERNAME || "interop@openhim.org",
  password: process.env.OPENHIM_PASSWORD || "interop-password",
  apiURL: process.env.OPENHIM_API_URL || "https://openhim-core:8080",
  trustSelfSigned: true,
  channel: process.env.OPENHIM_CHANNEL,
};

const CONFIG = {
  port: process.env.PORT || 6000,
};

const KHIS = {
  url: process.env.KHIS_URL,
  username: process.env.KHIS_USERNAME,
  password: process.env.KHIS_PASSWORD,
};

const DATABASE_PARAMS = {
  host: process.env.POSTGRES_SERVER_URL,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  port: process.env.POSTGRES_PORT || 5432
};

const MEDIATOR = {
  url: process.env.MEDIATOR_URL,
  username: process.env.MEDIATOR_USERNAME,
  password: process.env.MEDIATOR_PASSWORD,
};
const FHIR = {
  url: process.env.FHIR_URL,
};

const getCHTValuesFromEnv =(instance)=>{
  return ({
  url: process.env[`CHT_${instance}_URL`],
  username: process.env[`CHT_${instance}_USERNAME`],
  password: process.env[`CHT_${instance}_PASSWORD`],
  });
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

const KHMFL = {
  url: process.env.KHMFL_URL,
};

const CHANNEL_CONFIG_ENDPOINTS_URL = process.env.CHANNEL_CONFIG_ENDPOINTS_URL;

const UPSERT_DATA_VALUES_QUERY = process.env.UPSERT_DATA_VALUES_QUERY;

const CRON_SCHEDULE = process.env.CRON_SCHEDULE;

module.exports = {
  CHANNEL_CONFIG_ENDPOINTS_URL,
  CLIENT_REGISTRY,
  CONFIG,
  FHIR,
  KHIS,
  KHMFL,
  MEDIATOR,
  NHDD,
  OPENHIM,
  SNOMED_CT,
  getCHTValuesFromEnv,
  DATABASE_PARAMS,
  MEDIATOR,
  CHANNEL_CONFIG_ENDPOINTS_URL,
  UPSERT_DATA_VALUES_QUERY,
  CRON_SCHEDULE
};
