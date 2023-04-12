const {Pool} = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: '10.127.105.63',
  database: 'db_echis',
  password: 'fut4dm1n',
  port: 5432,
});

const KHIS_USER = 'echis';
const KHIS_PASSWORD = 'V1s10n@2030';
const OPENHIM_KHIS_CHANNEL = 'https://interop-gateway-staging.health.go.ke/interop/echis-mediator/aggregate';

const DATA_QUERY = `SELECT * FROM get_transformed_moh_515_data('chu', '1', 'months', false);`;

module.exports = {
  pool,
  DATA_QUERY,
  KHIS_USER,
  KHIS_PASSWORD,
  OPENHIM_KHIS_CHANNEL
};
