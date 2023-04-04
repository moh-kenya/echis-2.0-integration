const Pool = require('pg').Pool
const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: 5432,
});

const OPENHIM_USER = '';
const OPENHIM_USER_PASSWORD = '';
const OPENHIM_KHIS_CHANNEL = '';

const DATA_QUERY = `SELECT * FROM get_transformed_moh_515_data('chu', '1', 'months', false);`;

module.exports = {
  pool,
  DATA_QUERY,
  OPENHIM_USER,
  OPENHIM_USER_PASSWORD
};
