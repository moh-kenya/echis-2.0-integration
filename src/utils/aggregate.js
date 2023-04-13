const { Pool } = require('pg');
const { KHIS, POSTGRES } = require('../../config');

const pool = new Pool({
  user: POSTGRES.username,
  host: POSTGRES.host,
  database: POSTGRES.database,
  password: POSTGRES.password,
  port: POSTGRES.port
});

const DATA_QUERY = `SELECT * FROM get_transformed_moh_515_data('chu', '1', 'months', false);`;

module.exports = {
  pool,
  DATA_QUERY,
  KHIS
};
