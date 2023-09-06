const axios = require("axios");
const { pool, DATA_QUERY, KHIS } = require("../utils/aggregate");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { GETTING_MOH_515 } = messages;

const sendMoh515Data = async (data) => {
  logger.information("Sending MOH 515");
  try {
    const res = await axios.post(
      `${KHIS.url}/dataValueSets?orgUnitIdScheme=CODE`,
      data,
      {
        auth: { username: KHIS.username, password: KHIS.password },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const getMoh515Data = async (_, response) => {
  logger.information(GETTING_MOH_515);
  pool.query(DATA_QUERY, (error, results) => {
    if (error) {
      logger.error(error);
      throw error;
    }
    const result = results.rows;
    response.send(result);
    sendMoh515Data(JSON.stringify({ dataValues: result }));
  });
};

module.exports = {
  getMoh515Data,
};
