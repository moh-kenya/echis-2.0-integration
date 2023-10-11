const axios = require('axios');
const { logger } = require('./logger');
const _ = require('lodash');

const DATA_INGEST_EXTRA_KEYS = {
  COMPLETION_DATE: 'completeData',
  IS_PROCESSED: 'is_processed'
};

const getIsoDate = () => new Date().toISOString().slice(0, 10);

const getDataHeaders = (obj) => {
  const {dataSet, orgUnit, period} = obj;
  return obj;
};

const updateData = (obj, key, val) => _.set(obj, key, val);

const preparePostData = (data) => JSON.stringify(data);

const mapData = (item) => (groupedData) => ({
    ...getDataHeaders(item),
    dataValues: _.map(groupedData, data => ({
      dataElement: data.dataElement,
      value: data.value,
    })),
});

const formatData = (dataObjects) => {
  const formattedData = _.chain(dataObjects)
  .groupBy(item => `${item.dataSet}-${item.period}-${item.orgUnit}`)
  .map(groupedItems => {
    const first = _.first(groupedItems);
    return mapData(first)(groupedItems);
  })
  .value();
  return formattedData;
};

const postData = async (data, authParams) => {
  try {
    const response = await axios.post(`${authParams.url}/dataValueSets?orgUnitIdScheme=CODE`, data, {
      auth: {username: authParams.username, password: authParams.password},
      headers: {
        'Content-Type': 'application/json',
      }
    });
    logger.information(`${response.data.message}`);
    return true;
  } catch (error) {
    logger.error(error.response.data.message);
    return false;
  }
};

const postDataValueSets = async(dataValueSets, authParams) => {
  try {
    const processingPromises = dataValueSets.map(async (dataEntry) => {
      const processingResult = getDataHeaders(dataEntry);
      const completedPayload = updateData(dataEntry, DATA_INGEST_EXTRA_KEYS.COMPLETION_DATE, getIsoDate());
      const payloadToPost = preparePostData(completedPayload);
      const isProcessed = await postData(payloadToPost, authParams);
      return updateData(processingResult, DATA_INGEST_EXTRA_KEYS.IS_PROCESSED, isProcessed);
    });

    const results = await Promise.all(processingPromises);
    return results;
  } catch (error) {
    console.error('Error processing data:', error);
  }
};

module.exports = {
  formatData,
  postDataValueSets
};
