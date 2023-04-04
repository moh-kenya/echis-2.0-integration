const { pool, DATA_QUERY, OPENHIM_USER, OPENHIM_USER_PASSWORD } = require('../utils/aggregate');
const axios = require('axios');

const getMoh515Data = (request, response) => {
  pool.query(DATA_QUERY, (error, results) => {
    if (error) {
      throw error
    }
    const result = results.rows;
    response.send(result);
    sendMoh515Data(JSON.stringify({dataValues: result}));
  });
};

const sendMoh515Data = async (data) => {
  const res = await axios.post(`https://interoperabilitylab.uonbi.ac.ke/interop/mediator/emiddleware`, data, {
    auth: {username: OPENHIM_USER, password: OPENHIM_USER_PASSWORD},
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
};

module.exports = {
  getMoh515Data
};
