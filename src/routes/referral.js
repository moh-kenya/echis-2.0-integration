const { Router } = require("express");
const {
  createFacilityReferral,
  createCommunityReferral,
  createTaskReferral,
} = require("../controllers/referral");
const setInstance = require("../middlewares/setInstance");

const router = Router();
router.use(setInstance());
router.post("/community", async function (req, res) {
  const { status, referral } = await createCommunityReferral(req.body, res);
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(
    JSON.stringify(
    {
      "data": { referralData: referral},
      "errors": null
    },
    null, 3));
});

router.post("/facility", async function (req, res) {
  const { status, serviceRequestId } = await createFacilityReferral(req.body,res);
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(
    JSON.stringify(
    {
      "data": { documentID: serviceRequestId},
      "errors": null
    },
    null, 3));
  });

router.post("/taskReferral", async function (req, res) {
  const { status, referral } = await createTaskReferral(req.body,res);
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(
    JSON.stringify(
    {
      "data": { referralData: referral},
      "errors": null
    },
    null, 3));
});

module.exports = router;

// opehhim-url.com/echis-mediator/referral/community-referral
// opehhim-url.com/echis-mediator/referral/facility-referral
// opehhim-url.com/echis-mediator/client
