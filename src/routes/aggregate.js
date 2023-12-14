const {Router} = require('express');
const {runAggregateSummary, end} = require('../controllers/aggregate');
const {logger} = require('../utils/logger');

const router = Router();

router.get('/run',
  async () => {
    logger.information("Aggregator task started");
    await runAggregateSummary();
//    end();
    logger.information("Aggregator task completed");
  });

module.exports = router;
