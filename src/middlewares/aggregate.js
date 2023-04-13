const cron = require('node-cron');
const axios = require('axios');
const { MEDIATOR } = require('../../config');

const cronService = () => cron.schedule('*/1 * * * *', () => {
  console.log('running a task every five minutes');
  try {
    const res = axios.get(`${MEDIATOR.url}/echis-mediator/aggregate/run`, {
      auth: {username: MEDIATOR.username, password: MEDIATOR.password}
    });
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
});

module.exports = {
  cronService
};
