const { Router } = require("express");
const { clientFactory } = require("../controllers/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { CLIENT_ROUTE_INIT, CLIENT_ROUTE_COMPLETED, GENERATED_NUMBER } =
  messages;

const router = Router();

router.post("/", async function (req, res) {
  logger.information(CLIENT_ROUTE_INIT);
  clientFactory(req.body).then((clientNumber) => {
    logger.information(CLIENT_ROUTE_COMPLETED);
    logger.information(`${GENERATED_NUMBER} ${clientNumber}`);

    if (clientNumber?.startsWith("MOH")) {
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify({ upi: clientNumber }, null, 3));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.status(400).send(
        JSON.stringify(
          {
            error:
              "UPI Tasks failed. Possible reasons: Could not get UPI or Client details do not match CR details.",
          },
          null,
          3
        )
      );
    }
  });
});

module.exports = router;
