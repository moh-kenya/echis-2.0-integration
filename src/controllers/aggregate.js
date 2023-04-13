const axios = require('axios');
const { pool, DATA_QUERY, KHIS } = require('../utils/aggregate');

const sendMoh515Data = async (data) => {
  try {
    const res = await axios.post(`${KHIS.url}/dataValueSets`, data, {
      auth: {username: KHIS.username, password: KHIS.password},
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const getMoh515Data = async (_, response) => {
  pool.query(DATA_QUERY, (error, results) => {
    if (error) {
      console.error(`Error:${error}`);
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
