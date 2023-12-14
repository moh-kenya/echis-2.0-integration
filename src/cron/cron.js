const cron = require('node-cron');
const axios = require('axios');
const { logger } =require('../utils/logger');

const task = (authParams) => {
  try {
    const res = axios.get(`${authParams.url}/dhis2-mediator/aggregate/run`, {
      auth: {username: authParams.username, password: authParams.password}
    });
    return res;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const scheduleTask = (schedule, authParams) => {
  if (cron.validate(schedule)) {
    cron.schedule(schedule, () => task(authParams));
    logger.information('Task scheduled successfully.');
  } else {
    logger.error('Invalid cron schedule.');
  }
};

module.exports = {
  scheduleTask
};
