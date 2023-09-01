require('dotenv/config');

const OPENHIM = {
  username: process.env.OPENHIM_USERNAME || 'interop@openhim.org',
  password: process.env.OPENHIM_PASSWORD || 'interop-password',
  apiURL: process.env.OPENHIM_API_URL || 'https://openhim-core:8080',
  trustSelfSigned: true,
};

const CONFIG = {
  port: process.env.PORT || 6000
};

const KHIS = {
  url: process.env.KHIS_URL,
  username: process.env.KHIS_USERNAME,
  password: process.env.KHIS_PASSWORD,
  statusEndPoint: process.env.KHIS_STATUS_CHECK_ENDPOINT
};

const DATABASE_PARAMS = {
  host: process.env.POSTGRES_SERVER_URL,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  port: process.env.POSTGRES_PORT
};

const MEDIATOR = {
  url: process.env.MEDIATOR_URL,
  username: process.env.MEDIATOR_USERNAME,
  password: process.env.MEDIATOR_PASSWORD
};

const CHANNEL_CONFIG_ENDPOINTS_URL = process.env.CHANNEL_CONFIG_ENDPOINTS_URL;

const UPSERT_DATA_VALUES_QUERY = process.env.UPSERT_DATA_VALUES_QUERY;

const CRON_PARAMS = {
  unit: process.env.CRON_UNIT,
  value: process.env.CRON_VALUE,
  dayOfMonth: process.env.CRON_DAY_OF_MONTH
};

module.exports = {
  OPENHIM,
  CONFIG,
  KHIS,
  DATABASE_PARAMS,
  MEDIATOR,
  CHANNEL_CONFIG_ENDPOINTS_URL,
  UPSERT_DATA_VALUES_QUERY,
  CRON_PARAMS
};
