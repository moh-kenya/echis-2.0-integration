const morgan = require("morgan");
const express = require("express");
const promBundle = require("express-prom-bundle");
const path = require("path");

const { registerMediator } = require('openhim-mediator-utils');
const {OPENHIM, CONFIG, CHANNEL_CONFIG_ENDPOINTS_URL, CRON_SCHEDULE, MEDIATOR} = require('./config');
const clientRoutes = require('./src/routes/client');
const clientv2Routes = require('./src/routes/v2/client');
const referralRoutes = require('./src/routes/referral');
const referralv2Routes = require('./src/routes/v2/referral');
const aggregateRoutes = require('./src/routes/aggregate');
const { scheduleTask } = require('./src/cron/cron');
const { logger } = require('./src/utils/logger');
const { messages } = require('./src/utils/messages');

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

const app = express();
app.use(morgan());
app.use(promBundle({ includeMethod: true, includePath: true }));
app.use(express.json());

app.use("/client", clientRoutes);
app.use("/v2/client", clientv2Routes);
app.use("/referral", referralRoutes);
app.use("/v2/referral", referralv2Routes);
app.use("/aggregate", aggregateRoutes);

logger.information(ROUTES_SETUP_COMPLETE);

logger.information(CRON_SETUP);
scheduleTask(CRON_SCHEDULE, MEDIATOR);
logger.information(CRON_SETUP_COMPLETE);

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

if (process.env.ENV !== "dev") {
  registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);
}

app.get("/", (req, res) => {
  logger.information(LOAD_ROOT);
  res.status(200).sendFile(path.join(__dirname, "./src/html/", "success.html"));
});

module.exports = app;
