const axios = require('axios');
const { logger } = require('./logger');

const generateDataValueSets = async (dataObjects) => {
  const groupedData = {};
  dataObjects.forEach((item) => {
    const key = `${item.dataset}-${item.period}-${item.orgunit}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        dataSet: item.dataset,
        completeData: item.period + '01',
        period: item.period,
        orgUnit: item.orgunit,
        dataValues: []
      };
    }
    groupedData[key].dataValues.push({ dataElement: item.dataelement, value: item.value });
  });
  return Object.values(groupedData);
};

const postDataValueSet = async (dataValueSet, authParams) => {
  try {
    const response = await axios.post(`${authParams.url}/dataValueSets?orgUnitIdScheme=CODE`, dataValueSet, {
      auth: {username: authParams.username, password: authParams.password},
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status === 200) {
      logger.information(`Data value set posted successfully: ${response.data}`);
      return true;
    } else {
      logger.error(`Failed to post data value set: ${response.data}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error posting data value set: ${error}`);
    return error;
  }
};

const stringifyDataValueSet = (dataValueSet) => JSON.stringify(dataValueSet);

const postDataValueSets = async (dataValueSets, authParams) => {
  const updateParams = dataValueSets.map((entry) => {
    const payload = stringifyDataValueSet(entry);
    const isProcessed = postDataValueSet(payload, authParams);
    const { dataSet, orgUnit, period } = entry;
    return [dataSet, orgUnit, period, isProcessed];
  });

  return updateParams;
};

async function isDhis2ServerUp(serverParams) {
  try {
    const response = await axios.get(`${serverParams.url}${serverParams.statusEndPoint}`, { timeout: 5000 });
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateDataValueSets,
  postDataValueSets,
  isDhis2ServerUp
};
