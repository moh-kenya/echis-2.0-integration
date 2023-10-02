const { Router } = require("express");
const { clientFactory } = require("../controllers/client");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { CLIENT_ROUTE_INIT, CLIENT_ROUTE_COMPLETED, GENERATED_NUMBER } =
  messages;
  const {
    createFacilityReferral,
    createCommunityReferral,
    createTaskReferral,
  } = require("../controllers/referral");

const router = Router();

router.post("/:instance/client", async function (req, res) {
  global.instance= req.params.instance || "STAGING";
  logger.information(CLIENT_ROUTE_INIT);
  clientFactory(req.body, instance).then((response) => {
    logger.information(CLIENT_ROUTE_COMPLETED);

    if (response?.upi) {
      logger.information(`${GENERATED_NUMBER} ${response.upi || response}`);
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(
        JSON.stringify(
        {
          "data": { upi: response.upi },
          "errors": null
        },
         null, 3));
    } else {
      if (response.startsWith("MOH")) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).send(
          JSON.stringify(
            {
              "data": { upi: response },
              "errors": [
                {
                  "message": "UPI was created however, the document could not be uploaded to eCHIS!",
                  "path": [
                    "/client"
                  ]
                }
              ]
            }, null, 3)
      );
      } else {
        res.setHeader("Content-Type", "application/json");
        res.status(400).send(
          response
            ? response
            : {
              "data": null,
              "errors": [
                {
                  "message": "Something Failed on our end! Please try again Later.",
                  "path": [
                    "/client"
                  ]
                }
              ]
            }
      );
      }
    }
  });
});
router.post("/:instance/referral/community", async function (req, res) {
    global.instance= req.params.instance || "STAGING";
    const { status, referral } = await createCommunityReferral(req.body);
    res.setHeader("Content-Type", "application/json");
    res.status(status).send(
      JSON.stringify(
      {
        "data": { referralData: referral},
        "errors": null
      },
      null, 3));
  });
  
  router.post("/:instance/referral/facility", async function (req, res) {
    global.instance= req.params.instance || "STAGING";
    const { status, serviceRequestId } = await createFacilityReferral(req.body);
    res.setHeader("Content-Type", "application/json");
    res.status(status).send(
      JSON.stringify(
      {
        "data": { documentID: serviceRequestId},
        "errors": null
      },
      null, 3));
    });
  
  router.post("/:instance/referral/taskReferral", async function (req, res) {
    global.instance= req.params.instance || "STAGING";
    const { status, referral } = await createTaskReferral(req.body);
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
