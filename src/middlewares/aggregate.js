const cron = require('node-cron');
const axios = require('axios');
const { MEDIATOR } = require('../../config');
const {logger} =require('../utils/logger');

const cronService = () => cron.schedule('0 0 15 * *', () => {
  logger.information('Running DHIS 515 export');
  try {
    const res = axios.get(`${MEDIATOR.url}/echis-mediator/aggregate/run`, {
      auth: {username: MEDIATOR.username, password: MEDIATOR.password}
    });
    return res;
  } catch (error) {
    logger.error(error);
    return error;
  }
});

module.exports = {
  cronService
};
