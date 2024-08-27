const { Router } = require("express");
const { sendServiceRequest } = require("../../controllers/v2/referral");
const setInstance = require("../../middlewares/setInstance");

const router = Router();
router.use(setInstance());

router.post("/facility", async function (req, res) {
  const instance = response.locals.instanceValue;
  try {
    await sendServiceRequest(instance, req.body);
  } catch (error) {
    logger.err(error.message);
    res.status(400).send(JSON.stringify(error));
  }
});

module.exports = router;
