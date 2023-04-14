const { Router } = require("express");
const { searchClientByIdType } = require("../controllers/client");
const {logger} = require("../utils/logger");
const router = Router();

router.post("/", async function (req, res) {
  logger.information('Calling client route');
  const clientNumber = await searchClientByIdType(req.body);
  res.send(clientNumber);
});

module.exports = router;
