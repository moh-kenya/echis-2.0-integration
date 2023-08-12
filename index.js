const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const {registerMediator} = require('openhim-mediator-utils')
const {OPENHIM, CONFIG} = require('./config');
const aggregateRoutes = require('./src/routes/aggregate');
const {cronService} = require('./src/middlewares/aggregate');
const {logger} =require('./src/utils/logger');
const {getMohData} = require('./src/controllers/aggregate');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

logger.information("Setting up routes");
app.use('/aggregate', aggregateRoutes);
logger.information("Routes setup complete");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
logger.information("Setting up cron services");
//cronService();
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

//app.post('/echismonthlyreport', function (req, res) {
//	console.log("Got a POST request from openHIM");
//});

const mediatorConfig = {
  urn: "urn:mediator:echis-mediator",
  version: "1.0.0",
  name: "eCHIS Mediator",
  description:
    "A mediator eCHIS to KHIS integration.",
  defaultChannelConfig: [
    {
      name: "eCHIS Mediator",
      urlPattern: "^/echis-mediator/.*$",
      routes: [
        {
          name: "eCHIS Mediator",
          //host: "http://45.91.169.147",
          host: "echisMonthlyReportMediator",
          //pathTransform: "s/\\/echis-mediator/",
          path:"/",
          port: "6000",
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
      //host: "http://45.91.169.147/echis-mediator",
      host: "echismonthlyreport",
      path: "/",
      port: "6000",
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
