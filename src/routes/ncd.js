const { Router } = require('express');
const { runAggregateSummary, end } = require('../controllers/aggregate');
const { logger } = require('../utils/logger');
const { messages } = require('../utils/messages');
const { spiceInstance, sendToSpice } = require('../controllers/ncd');

const router = Router();

router.post("/diabetes", sendToSpice);
router.post("/hypertension", async (req, res) => {
    logger.information("Hit hypertension endpoint")
    res.status(400).send("Working")
});

module.exports = router;
