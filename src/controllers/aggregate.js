const { KHIS } = require('../../config');

const {
  query,
  end
} = require('../utils/db');

const {
  ANALYTICS_INGEST_TABLE_QUERY,
  ANALYTICS_DATA_VALUES_TABLE_QUERY,
  UPSERT_INGEST_TRIGGER_FUNCTION_QUERY,
  UPSERT_INGEST_TRIGGER_QUERY,
  EXTRACT_DATA_QUERY,
  UPSERT_INGEST_STATUS_QUERY,
  UPSERT_DATA_VALUES_QUERY
} = require('../postgres/analytics');

const {
  generateDataValueSets,
  postDataValueSets,
  isDhis2ServerUp
} = require('../utils/khis');

const { logger } = require('../utils/logger');

const prepareDatabase = async (queries) => queries.forEach(async (preparedStatement) => await query(preparedStatement));

const runAggregateSummary = async () => {
  const queries = [ANALYTICS_INGEST_TABLE_QUERY, ANALYTICS_DATA_VALUES_TABLE_QUERY, UPSERT_INGEST_TRIGGER_FUNCTION_QUERY, UPSERT_INGEST_TRIGGER_QUERY, UPSERT_DATA_VALUES_QUERY];
  await prepareDatabase(queries);

  const serverIsUp = await isDhis2ServerUp();

  if(serverIsUp){
    console.log(`DHIS2 server is up. Processing upload ...`);
    const rawData = await query(EXTRACT_DATA_QUERY);
    const dataValueSets = await generateDataValueSets(rawData);
    const postResponseArray = await postDataValueSets(dataValueSets, KHIS);
    await query(UPSERT_INGEST_STATUS_QUERY, postResponseArray);
  } else {
    logger.error('DHIS2 server is down or unreachable.');
  };
};

(async () => {
  await runAggregateSummary();
  // await end();
})();
