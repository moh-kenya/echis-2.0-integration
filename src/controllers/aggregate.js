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
    await prepareDatabase(queries);
    const rawData = await query(EXTRACT_DATA_QUERY);
    const formattedData = formatData(rawData);
    const postResponseArray = await postDataValueSets(formattedData, KHIS);
    const updateDataIngestQuery = getUpsertDataIngestQuery(postResponseArray);
    await query(updateDataIngestQuery);
  }catch(err){
    logger.error(err);
  }
};

module.exports = {
  runAggregateSummary,
  end
};
