const {pool, DATA_QUERY, KHIS_USER, KHIS_PASSWORD, OPENHIM_KHIS_CHANNEL} = require('../utils/aggregate');
const axios = require('axios');

const sendMoh515Data = async (data) => {
  const res = await axios.post(OPENHIM_KHIS_CHANNEL, data, {
    auth: {username: KHIS_USER, password: KHIS_PASSWORD},
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res;
};

const getMoh515Data = (request, response) => {
  pool.query(DATA_QUERY, (error, results) => {
    if (error) {
      throw error;
    }
    const result = results.rows;
    response.send(result);
    sendMoh515Data(JSON.stringify({dataValues: result}));
  });
};

module.exports = {
  getMoh515Data
};
