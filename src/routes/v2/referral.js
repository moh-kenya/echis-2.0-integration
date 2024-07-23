const { Router } = require("express");
const { sendServiceRequest } = require("../../controllers/v2/referral");
const setInstance = require("../../middlewares/setInstance");

const router = Router();
router.use(setInstance());

router.post("/facility", async function (req, res) {
  try {
    const { status, serviceRequestId } = await sendServiceRequest(
      req.body,
      res
    );
    res.setHeader("Content-Type", "application/json");
    res.status(status).send(
      JSON.stringify(
        {
          data: { documentID: serviceRequestId },
          errors: null,
        },
        null,
        3
      )
    );
  } catch (error) {
    if (error.status) {
      res.status(error.status).send(error.body);
      return;
    }
    res.status(400).send(JSON.stringify(error));
  }
});

module.exports = router;
