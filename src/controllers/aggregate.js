const { KHIS } = require('../../config');

const {
  query,
  end
} = require('../utils/db');

const {
  ANALYTICS_INGEST_TABLE_QUERY,
  ANALYTICS_DATA_VALUES_TABLE_QUERY,
  EXTRACT_DATA_QUERY,
  UPSERT_DATA_VALUES_QUERY,
  getUpsertDataIngestQuery,
  UPSERT_INGEST_DATA_QUERY
} = require('../postgres/analytics');

const {
  formatData,
  postDataValueSets
} = require('../utils/khis');

const { logger } = require('../utils/logger');

const prepareDatabase = async (queries) => queries.forEach(async (preparedStatement) => await query(preparedStatement));

const runAggregateSummary = async () => {
  const queries = [ANALYTICS_INGEST_TABLE_QUERY, ANALYTICS_DATA_VALUES_TABLE_QUERY, UPSERT_DATA_VALUES_QUERY, UPSERT_INGEST_DATA_QUERY];
    try{
    logger.information("Preparing the database");
    await prepareDatabase(queries);
    logger.information("Done preparing the database");
    logger.information("Extracting the data");
    const rawData = await query(EXTRACT_DATA_QUERY);
    logger.information("Data Extracted");
    logger.information("Formating the data");
    const formattedData = formatData(rawData);
    logger.information("Data formated");
    logger.information("Posting data value set");
    const postResponseArray = await postDataValueSets(formattedData, KHIS);
    logger.information("Data posted");
    logger.information("Get upsert data injest");
    const updateDataIngestQuery = getUpsertDataIngestQuery(postResponseArray);
    logger.information("Update data injest");
    await query(updateDataIngestQuery);
  }catch(err){
    logger.error(err);
  }
};

module.exports = {
  runAggregateSummary,
  end
};
