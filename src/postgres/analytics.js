const { UPSERT_DATA_VALUES_QUERY } = require('../../config');

const ANALYTICS_INGEST_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS aggregate_data_ingest (
    id SERIAL NOT NULL,
    dataSet VARCHAR(20) NOT NULL,
    orgUnit VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    is_processed BOOLEAN DEFAULT false,
    last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY(id),
    UNIQUE(dataSet, orgUnit, period)
  ) 
  WITH (oids = false);`;

const ANALYTICS_DATA_VALUES_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS aggregate_data_values (
    dataSet VARCHAR(20) NOT NULL,
    orgUnit VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    dataElement VARCHAR(20) NOT NULL,
    value INTEGER DEFAULT 0 NOT NULL,
    last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(dataSet, orgUnit, period, dataElement)
  );`;

const EXTRACT_DATA_QUERY = `
  SELECT
    v.dataSet AS "dataSet",
    v.orgUnit AS "orgUnit",
    v.period AS period,
    v.dataElement AS "dataElement",
    v.value AS value
  FROM
    aggregate_data_values v
    LEFT JOIN aggregate_data_ingest i ON (v.dataSet = i.dataSet AND v.orgUnit = i.orgUnit AND v.period = i.period)
  WHERE
    i.is_processed IS FALSE
    AND i."period" = TO_CHAR((CURRENT_DATE - INTERVAL '1 month'), 'YYYYMM');`;

const UPSERT_INGEST_TRIGGER_FUNCTION_QUERY = `
  CREATE OR REPLACE FUNCTION update_aggregate_data_ingest()
  RETURNS TRIGGER AS
  $$
  BEGIN
      UPDATE aggregate_data_ingest
      SET is_processed = FALSE
      WHERE dataSet = NEW.dataSet AND orgUnit = NEW.orgUnit AND period = NEW.period;

      IF NOT FOUND THEN
          INSERT INTO aggregate_data_ingest (dataSet, orgUnit, period)
          VALUES (NEW.dataSet, NEW.orgUnit, NEW.period);
      END IF;

      RETURN NEW;
  END;
  $$
  LANGUAGE plpgsql;
  `;

  const UPSERT_INGEST_TRIGGER_QUERY = `
  DROP TRIGGER IF EXISTS update_aggregate_data_ingest_trigger ON aggregate_data_values;
  CREATE TRIGGER update_aggregate_data_ingest_trigger
  AFTER INSERT ON aggregate_data_values
  FOR EACH ROW
  EXECUTE FUNCTION update_aggregate_data_ingest();
  `;

const getUpsertDataIngestQuery = (values) => {
  return `
  INSERT INTO aggregate_data_ingest (dataSet, orgUnit, period, is_processed)
  VALUES    
    ${values.map(item => `('${item.dataSet}', '${item.orgUnit}', '${item.period}', ${item.is_processed})`).join(',')}
  ON CONFLICT (dataSet, orgUnit, period)
  DO UPDATE SET is_processed = EXCLUDED.is_processed;`;
};

const UPSERT_INGEST_DATA_QUERY = `INSERT INTO aggregate_data_ingest (dataSet, orgUnit, period)
SELECT
  "dataSet" AS dataset,
  "orgUnit" AS orgunit,
  period
FROM
  aggregateview_moh_515_last_month
GROUP BY
  dataset,
  orgunit,
  period ON CONFLICT (dataSet,
    orgUnit,
    period)
  DO
  NOTHING;`;

module.exports = {
  ANALYTICS_INGEST_TABLE_QUERY,
  ANALYTICS_DATA_VALUES_TABLE_QUERY,
  UPSERT_INGEST_TRIGGER_FUNCTION_QUERY,
  UPSERT_INGEST_TRIGGER_QUERY,
  EXTRACT_DATA_QUERY,
  UPSERT_DATA_VALUES_QUERY,
  getUpsertDataIngestQuery,
  UPSERT_INGEST_DATA_QUERY
};
