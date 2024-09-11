const { Router } = require("express");
const { sendServiceRequest } = require("../../controllers/v2/referral");
const setInstance = require("../../middlewares/setInstance");
const { logger } = require("../../utils/logger");

const router = Router();
router.use(setInstance());

router.post("/facility", async function (req, res) {
  const instance = res.locals.instanceValue;
  try {
    await sendServiceRequest(instance, req.body);
    res.status(200).send();
  } catch (error) {
    logger.error(error.message);
    res.status(400).send(JSON.stringify(error));
  }
});

module.exports = router;
