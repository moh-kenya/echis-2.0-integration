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

const mapData = (item) => (groupedData) => {
  const payload = {
    ...getDataHeaders(item),
    dataValues: _.map(groupedData, data => ({
      dataElement: data.dataElement,
      value: data.value,
    }))
  };
  delete payload.dataElement;
  delete payload.value;
  return payload;
};

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
    console.log(error);
    logger.error('HTTP Status 401 - Bad credentials or Request failed.');
    return false;
  }
};

const sleep = m => new Promise(r => setTimeout(r, m));

const postDataValueSets = async(dataValueSets, authParams) => {
  try {
    const processingResults = [];

    for (const dataEntry of dataValueSets) {
      logger.information("Getting data headers");
      const processingResult = getDataHeaders(dataEntry);
      logger.information("Done getting data headers");

      logger.information("Updating data");
      const completedPayload = updateData(dataEntry, DATA_INGEST_EXTRA_KEYS.COMPLETION_DATE, getIsoDate());
      logger.information("Done updating data");

      logger.information("Preparing post data");
      const payloadToPost = preparePostData(completedPayload);
      logger.information("Done preparing post data");

      logger.information("Posting data");
      console.log(payloadToPost);
      const isProcessed = await postData(payloadToPost, authParams);
      logger.information("Done posting data");

      logger.information("Update posted data");
      const updatedData = updateData(processingResult, DATA_INGEST_EXTRA_KEYS.IS_PROCESSED, isProcessed);

      processingResults.push(updatedData);

      await sleep(5000); // wait for 5 seconds before processing the next dataEntry
    }

    return processingResults;
  } catch (error) {
    console.error('Error processing data:', error);
  }
};


module.exports = {
  formatData,
  postDataValueSets
};
