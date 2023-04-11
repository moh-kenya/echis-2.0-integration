const {Pool} = require('pg');
const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: 5432,
});

const dataQuery = 'SELECT * FROM get_moh_515_data(\'chu\', \'3\', \'months\', false) serviceData LEFT JOIN (SELECT * FROM get_moh_515_community_events_data(\'chu\', \'3\', \'months\', false)) as eventsData ON (serviceData.chu_uuid=eventsData.chu_uuid AND serviceData.period_start = eventsData.period_start)\'';

module.exports = {
  pool,
  dataQuery
};
