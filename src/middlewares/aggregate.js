const cron = require('node-cron');
const axios = require('axios');

cron.schedule('0 * * * *', () => axios.get(`/aggregate`));
