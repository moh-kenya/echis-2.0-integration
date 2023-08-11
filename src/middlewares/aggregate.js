const cron = require('node-cron');
const axios = require('axios');
const { MEDIATOR } = require('../../config');
const {logger} =require('../utils/logger');

const cronService = () => cron.schedule('0 0 15 * *', () => {
  logger.information('Running MoH 515 export');
  try {
    const res = axios.get(`${MEDIATOR.url}/echis-mediator/aggregate/run`, {
      auth: {username: MEDIATOR.username, password: MEDIATOR.password}
    });

    //checkig if cronjob has been able to connect to mediator
    var resObject = $.extend(resObject,res);
    var resString = JSON.stringify(resObject);
    let connError = false;
    if(resString.search(/cause: Error: connect ECONNREFUSED/)){
      connError = true;
    }

    logger.information("Cronjob cannot connect with the mediator");

    //return the respose object
    return res;
  } 
  catch (error) {
    logger.error(error);
    logger.information("Error Exporting");
    return error;
  }
});

module.exports = {
  cronService
};
