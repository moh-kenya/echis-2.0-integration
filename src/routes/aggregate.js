const {Router} = require('express');
const {getMoh515Data} = require('../controllers/aggregate');
const {logger} = require('../utils/logger');

const router = Router();

router.get('/run',
  async (req, res) => {
    logger.information("Aggregator task started");
    await getMoh515Data(req, res);
    logger.information("Aggregator task completed");
  });

module.exports = router;
