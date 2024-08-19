const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");

const app = express();

const { registerMediator } = require("openhim-mediator-utils");
const {
  OPENHIM,
  CONFIG,
  CHANNEL_CONFIG_ENDPOINTS_URL,
  CRON_SCHEDULE,
  MEDIATOR,
} = require("./config");
const clientRoutes = require("./src/routes/client");
const referralRoutes = require("./src/routes/referral");
const aggregateRoutes = require("./src/routes/aggregate");
const { scheduleTask } = require("./src/cron/cron");
const { logger } = require("./src/utils/logger");
const { messages } = require("./src/utils/messages");

const {
  ROUTES_SETUP,
  ROUTES_SETUP_COMPLETE,
  CRON_SETUP,
  CRON_SETUP_COMPLETE,
  SERVER_PORT,
  MEDIATOR_FAILURE,
  MEDIATOR_SUCCESS,
  LOAD_ROOT,
} = messages;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

logger.information(ROUTES_SETUP);

app.use("/client", clientRoutes);
app.use("/referral", referralRoutes);
app.use("/aggregate", aggregateRoutes);

logger.information(ROUTES_SETUP_COMPLETE);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Disabled CRON since KHIS<>eCHIS integration was moved to NiFi
// logger.information(CRON_SETUP);
// scheduleTask(CRON_SCHEDULE, MEDIATOR);
// logger.information(CRON_SETUP_COMPLETE);

app.listen(CONFIG.port, () => {
  logger.information(`${SERVER_PORT} ${CONFIG.port}`);
});

const registerMediatorCallback = (err) => {
  if (err) {
    //throw new Error(`${MEDIATOR_FAILURE} ${err}`);
  }
  logger.information(MEDIATOR_SUCCESS);
};

const mediatorConfig = {
  urn: `urn:mediator:${OPENHIM.channel}`,
  version: "1.0.0",
  name: "eCHIS Mediator",
  description: "A mediator eCHIS to KHIS integration.",
  defaultChannelConfig: [
    {
      name: "eCHIS Mediator",
      urlPattern: `^/${OPENHIM.channel}/.*$`,
      routes: [
        {
          name: "eCHIS Mediator",
          host: CHANNEL_CONFIG_ENDPOINTS_URL,
          pathTransform: `s/\\/${OPENHIM.channel}/`,
          port: 22000,
          primary: true,
          type: "http",
        },
      ],
      allow: ["echis"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      type: "http",
    },
  ],
  endpoints: [
    {
      name: "Mediator",
      host: CHANNEL_CONFIG_ENDPOINTS_URL,
      path: "/",
      port: "22000",
      primary: true,
      type: "http",
    },
  ],
};

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

app.get("/", (req, res) => {
  logger.information(LOAD_ROOT);
  res.status(200).sendFile(path.join(__dirname, "./src/html/", "success.html"));
});

module.exports = app;
