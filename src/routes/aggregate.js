const { Router } = require('express');
const { runAggregateSummary, end } = require('../controllers/aggregate');
const { logger } = require('../utils/logger');
const { messages } = require('../utils/messages');
const { AGGREG_TASK_STARTED, AGGREG_TASK_COMPLETED } = messages;
const router = Router();

router.get("/run", async (req, res) => {
  logger.information(AGGREG_TASK_STARTED);
  await runAggregateSummary();
  end();
  logger.information(AGGREG_TASK_COMPLETED);
});

module.exports = router;
