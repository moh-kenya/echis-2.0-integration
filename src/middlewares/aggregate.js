const cron = require('node-cron');
const axios = require('axios');
const { MEDIATOR } = require('../../config');
const {logger} =require('../utils/logger');

  const cronService = () => cron.schedule('0 0 5 * *', () => {
  //const cronService = () => cron.schedule('* * * * *', () => {
  logger.information('Running MoH 515 export');
  try {
    const res = axios.get(`${MEDIATOR.url}/echis-mediator/aggregate/run`, {
      auth: {username: MEDIATOR.username, password: MEDIATOR.password}
    });
    logger.information('Export successful');
    return res;
  } catch (error) {
    logger.error(error);
    logger.information('Error exporting');
    return error;
  }
});

module.exports = {
  cronService
};
