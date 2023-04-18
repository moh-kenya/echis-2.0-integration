const { Router } = require("express");
const { clientFactory } = require("../controllers/client");
const {logger} = require("../utils/logger");
const router = Router();

router.post("/", async function (req, res) {
  logger.information('Client route initiated');
  const clientNumber = await clientFactory(req.body);
  logger.information('Client route completed');
  res.send(clientNumber);
});

module.exports = router;
