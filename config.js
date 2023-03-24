require("dotenv/config");

const OPENHIM = {
  username: process.env.OPENHIM_USERNAME || "interop@openhim.org",
  password: process.env.OPENHIM_PASSWORD || "interop-password",
  apiURL: process.env.OPENHIM_API_URL || "https://openhim-core:8080",
  trustSelfSigned: true,
};

const FHIR = {
  url: process.env.FHIR_URL,
}

const CHT = {
  url: process.env.CHT_URL,
  username: process.env.CHT_USERNAME,
  password: process.env.CHT_PASSWORD,
}

module.exports = {
  OPENHIM,
  FHIR,
  CHT,
};
