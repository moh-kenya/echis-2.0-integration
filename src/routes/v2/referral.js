const { Router } = require("express");
const {
  createCommunityReferral,
  createTaskReferral,
  sendServiceRequest,
} = require("../../controllers/referral");
const setInstance = require("../../middlewares/setInstance");

const router = Router();
router.use(setInstance());
router.post("/community", async function (req, res) {
  const { status, referral, errors } = await createCommunityReferral(
    req.body,
    res
  );
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(
    JSON.stringify(
      {
        data: { referralData: referral },
        errors: errors,
      },
      null,
      3
    )
  );
});

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

router.post("/taskReferral", async function (req, res) {
  const { status, referral } = await createTaskReferral(req.body, res);
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(
    JSON.stringify(
      {
        data: { referralData: referral },
        errors: null,
      },
      null,
      3
    )
  );
});

module.exports = router;

// opehhim-url.com/echis-mediator/referral/community-referral
// opehhim-url.com/echis-mediator/referral/facility-referral
// opehhim-url.com/echis-mediator/client
