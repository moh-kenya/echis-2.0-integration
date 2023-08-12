const cron = require('node-cron');
const axios = require('axios');
const { MEDIATOR } = require('../../config');
const {logger} =require('../utils/logger');

  //const cronService = () => cron.schedule('0 0 5 * *', () => {
  const cronService = () => cron.schedule('*/30 * * * * *', () => {
  logger.information('Running MoH 515 export');
  try {
    //const res = axios.get(`${MEDIATOR.url}/echis-mediator/aggregate/run`, {
    const res = axios.get(`${MEDIATOR.url}/aggregate/run`, {
      auth: {username: MEDIATOR.username, password: MEDIATOR.password}
    });

    res.then(resp => {

    });

    //return the respose obje
    if(JSON.stringify(res).search(/Error: connect ECONNREFUSED/)){
      logger.error("Cronjob cannot connect with the mediator");
      logger.error(res.AxiosError);
      //return res;
    }
    else if(JSON.stringify(res).search(/BAD REQUEST/)){
      logger.error("Mediator could not process the request");
      logger.error(res.AxiosError);
      //return res;
    }
    else{
      logger.information('Export successful');
      return res;

    }

    //return res;
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
