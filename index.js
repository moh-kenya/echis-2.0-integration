const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const {registerMediator} = require('openhim-mediator-utils');
const {OPENHIM, CONFIG} = require('./config');
const registryRoutes = require('./src/routes/client');
const referralRoutes = require('./src/routes/referral');
const aggregateRoutes = require('./src/routes/aggregate');
const {cronService} = require('./src/middlewares/aggregate');
const {logger} =require('./src/utils/logger');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

logger.information("Setting up routes");
app.use('/client', registryRoutes);
app.use('/referral', referralRoutes);
app.use('/aggregate', aggregateRoutes);
logger.information("Routes setup complete");

const PORT = CONFIG.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
logger.information("Setting up cron services");
cronService();
logger.information("Cron services setup complete");
app.listen(PORT, () => {
  logger.information(`Server listening on port ${PORT}`);
});

const registerMediatorCallback = (err) => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }
  logger.information('Successfully registered mediator.');
};

const mediatorConfig = {
  urn: 'urn:mediator:echis-mediator',
  version: '1.0.0',
  name: 'eCHIS Mediator',
  description: 'A mediator for CHIS to handle client registry and referral workflows.',
  defaultChannelConfig: [
    {
      name: 'eCHIS Mediator',
      urlPattern: '^/echis-mediator/.*$',
      routes: [
        {
          name: 'eCHIS Mediator',
          host: 'https://mediator-staging.health.go.ke',
          pathTransform: 's/\\/echis-mediator/',
          port: 22000,
          primary: true,
          type: 'http',
        },
      ],
      allow: ['echis'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      type: 'http',
    },
  ],
  endpoints: [
    {
      name: 'Mediator',
      host: 'https://mediator-staging.health.go.ke',
      path: '/',
      port: '22000',
      primary: true,
      type: 'http',
    },
  ],
};

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

app.get('/', (req, res) => {
  logger.information('Loading the root route')
  res.send('Loaded');
});
