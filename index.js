const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const {registerMediator} = require('openhim-mediator-utils')
const {OPENHIM, CONFIG, CHANNEL_CONFIG_ENDPOINTS_URL, CRON_SCHEDULE, MEDIATOR} = require('./config');
const aggregateRoutes = require('./src/routes/aggregate');
const {scheduleTask} = require('./src/cron/cron');
const {logger} =require('./src/utils/logger');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

logger.information("Setting up routes");
app.use('/aggregate', aggregateRoutes);
logger.information("Routes setup complete");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
logger.information("Setting up cron services");
scheduleTask(CRON_SCHEDULE, MEDIATOR);
logger.information("Cron services setup complete");

app.listen(CONFIG.port, () => {
  logger.information(`Server listening on port ${CONFIG.port}`);
});

const registerMediatorCallback = (err) => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }
  logger.information('Successfully registered mediator.');
};

const mediatorConfig = {
  urn: "urn:mediator:dhis2-mediator",
  version: "1.0.0",
  name: "DHIS2 Mediator",
  description:
    "A mediator eCHIS to KHIS integration.",
  defaultChannelConfig: [
    {
      name: "DHIS2 Mediator",
      urlPattern: "^/dhis2-mediator/.*$",
      routes: [
        {
          name: "eCHIS Mediator",
          host: CHANNEL_CONFIG_ENDPOINTS_URL,
          pathTransform: "s/\\/dhis2-mediator/",
          port: 22001,
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
      port: "22001",
      primary: true,
      type: "http",
    },
  ],
};

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

app.get('/', (req, res) => {
  logger.information('Loading the root route')
  res.send('Loaded');
});

app.get("/", (req, res) => {
  res.status(200).send("Loaded");
});

module.exports = app;
