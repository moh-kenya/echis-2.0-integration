const { Router } = require("express");
const { clientFactory } = require("../controllers/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { CLIENT_ROUTE_INIT, CLIENT_ROUTE_COMPLETED, CLIENT_DETAILS_MISMATCH, GENERATED_NUMBER } =
  messages;

const router = Router();

router.post("/", async function (req, res) {
  logger.information(CLIENT_ROUTE_INIT);
  clientFactory(req.body).then((response) => {
    logger.information(CLIENT_ROUTE_COMPLETED);

    if (response?.upi || response?.msg === CLIENT_DETAILS_MISMATCH) {
      logger.information(`${GENERATED_NUMBER} ${response.upi || response}`);
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(response), null, 3);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.status(400).send(
        response
          ? response
          : {
              error: "ProcessError",
              message: "Something Failed on our end! Please try again Later.",
            }
      );
    }
  });
});

module.exports = router;
