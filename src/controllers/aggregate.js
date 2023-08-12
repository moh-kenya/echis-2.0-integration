const axios = require('axios');
const { pool, DATA_QUERY, KHIS } = require('../utils/aggregate');
const {logger} = require('../utils/logger');
const {MEDIATOR} = require('../../config');
const express = require("express");
const app = express();

const sendMoh515Data = async (data) => {
  logger.information("Sending MOH 515");
  try {
    const res = await axios.post(`${KHIS.url}/dataValueSets?orgUnitIdScheme=CODE`, data, {
      auth: {username: KHIS.username, password: KHIS.password},
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res;
  }
  catch (error) {
    locgger.error("Could not connect to KHIS, see error details below");
    logger.error(error);
    return error;
  }
};

const getMoh515Data = async (_, response) => {
  logger.information("Getting MOH 515 data");;
  pool.query(DATA_QUERY, (error, results) => {
    if (error) {
      if(JSON.stringify(error).search(/connect ECONNREFUSED /)){
        logger.error("Cannot connect to PostgreSQL databse for attempt");
        logger.error(error);
        return response.send("Cannot connect to PostgreSQL databse for attempt");
      }
      else{
        logger.error("Unknown error, see elaboration below");
        logger.error(error);
        return response.send("Unknown error. Connection to PostgreSQL database seems to be down")
      }
      //let refetchData = setInterval(function(){ getMoh515Data(_, response); }, 30000);
      //throw error;
    }
    else{
        const result = results.rows;
        response.send(result);
        sendMoh515Data(JSON.stringify({dataValues: result}));
        logger.information("Aggregator task completed");
    }
    /*const result = results.rows;
    response.send(result);
    sendMoh515Data(JSON.stringify({dataValues: result}));*/
  });
};

app.get('/get515Data', getMoh515Data);

module.exports = {
  getMoh515Data
};
