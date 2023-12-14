const axios = require("axios");
const { generateTokenSpice } = require("../utils/auth");
const { SPICE } = require("../../config");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { generateDiabetesPayload } = require("../utils/ncd");
const { GEN_TOKEN_FAILURE } = messages;

const trySpiceReauth = async (error) => {
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }

  const originalRequest = error.config;
  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  logger.information("Re-authenticating SPICE");
  try {
    originalRequest._retry = true;
    const token = await generateTokenSpice();
    axiosSpiceInstance.defaults.headers.common["Authorization"] = `${token}`;
    return axiosSpiceInstance(originalRequest);
  } catch (err) {
    logger.error(
      `${GEN_TOKEN_FAILURE} ${err.response.status} ${err.response.body}`
    );
  }

  return Promise.reject(error);
};

const createSpiceClient = (req,res) => {
  const payload = generateDiabetesPayload(req.body);
  return axiosSpiceInstance
    .post(`/spice-service/patient/enrollment`, payload, {
      headers: {
        "Content-Type": "application/json",
        "tenantid":75
      },
    })
    .then((resp) => {
      logger.information("NCD Record sent Successfully");
      res.status(200).send(payload);
    }).catch((err)=>{
      console.log(err.response)
      logger.information("NCD Record Already exists");
      res.status(304).send(payload);})
};

async function sendToSpice(req, res) {
try {
  const clientNumber = await createSpiceClient(req,res);
} catch (err) {
  logger.error(err);
  res.status(400).send({ error: "kwisha" });
}
};

const axiosSpiceInstance = axios.create({
  baseURL: SPICE.url,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosSpiceInstance.interceptors.response.use(
  (response) => response,
  trySpiceReauth
);


module.exports = {
  spiceInstance: axiosSpiceInstance,
  sendToSpice,
};
