const {Pool} = require('pg');
const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: 5432,
});

<<<<<<< HEAD
const OPENHIM_USER = '';
const OPENHIM_USER_PASSWORD = '';
const OPENHIM_KHIS_CHANNEL = '';

const DATA_QUERY = `SELECT * FROM get_transformed_moh_515_data('chu', '1', 'months', false);`;
=======
const dataQuery = 'SELECT * FROM get_moh_515_data(\'chu\', \'3\', \'months\', false) serviceData LEFT JOIN (SELECT * FROM get_moh_515_community_events_data(\'chu\', \'3\', \'months\', false)) as eventsData ON (serviceData.chu_uuid=eventsData.chu_uuid AND serviceData.period_start = eventsData.period_start)\'';
>>>>>>> main

module.exports = {
  pool,
  DATA_QUERY,
  OPENHIM_USER,
  OPENHIM_USER_PASSWORD
};
