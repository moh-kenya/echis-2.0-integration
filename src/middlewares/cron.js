const cron = require('node-cron');
const axios = require('axios');
const { logger } =require('../utils/logger');

const convertToCron = (cronParams) => {
  const cronParts = {
    minutes: '*',
    hours: '0',
    days: '0',
    months: '*',
  };

  switch (cronParams.unit) {
    case 'minutes':
    case 'hours':
    case 'days':
      cronParts[cronParams.unit] = `*/${cronParams.value}`;
      break;
    case 'months':
      if (!cronParams.dayOfMonth || cronParams.dayOfMonth < 1 || cronParams.dayOfMonth > 31) {
        throw new Error('Invalid day of month');
      }
      cronParts.days = dayOfMonth;
      break;
    default:
      throw new Error('Invalid time unit');
  }

  return `${cronParts.minutes} ${cronParts.hours} ${cronParts.days} ${cronParts.months} * *`;
};

const executeCron = (cronOptions, authParams) => {
  const cronString = convertToCron(cronOptions);
  cron.schedule(cronString, () => {
  logger.information(`Processing scheduled aggregate reporting service`);
  try {
    const res = axios.get(`${authParams.url}/echis-mediator/aggregate/run`, {
      auth: {username: authParams.username, password: authParams.password}
    });
    return res;
  } catch (error) {
    logger.error(error);
    return error;
  }
});
};

module.exports = {
  executeCron
};
