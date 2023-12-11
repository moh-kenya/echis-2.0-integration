const { Client } = require('pg');
const { logger } = require('./logger');
const { DATABASE_PARAMS } = require('../../config');

const client = new Client({
  host: DATABASE_PARAMS.host,
  port: DATABASE_PARAMS.port,
  database: DATABASE_PARAMS.database,
  user: DATABASE_PARAMS.user,
  password: DATABASE_PARAMS.password
});

client.connect((err) => {
  if (err) {
    logger.error(`Database connection error: ${err.message}`);
    return err;
  }
  logger.information(`Connected to the database`);
});

const query = async (preparedStatement, params) => {
  try {
    const result = await client.query(preparedStatement, params);
    logger.information(`Query executed.`);
    console.log(result.rows);
    return result.rows;
  } catch (error) {
    logger.error(`Database query error: ${error.message} in ${preparedStatement}`);
  }
};

const end = () => client.end();

module.exports = {
  query,
  end
};
