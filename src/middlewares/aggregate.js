const cron = require('node-cron');
const axios = require('axios');

const cronService = () => cron.schedule('*/1 * * * *', () => {
  console.log('running a task every five minutes');
  try {
    const res = axios.get(`/aggregate`);
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
});

module.exports = {
  cronService
};
