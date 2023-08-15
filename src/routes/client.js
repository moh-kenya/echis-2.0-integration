const { Router } = require("express");
const { clientFactory } = require("../controllers/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { CLIENT_ROUTE_INIT, CLIENT_ROUTE_COMPLETED } = messages;

const router = Router();

router.post("/", async function (req, res) {
  logger.information(CLIENT_ROUTE_INIT);
  const clientNumber = await clientFactory(req.body);
  logger.information(CLIENT_ROUTE_COMPLETED);
  res.send(clientNumber);
});

module.exports = router;
