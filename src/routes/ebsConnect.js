const { Router } = require("express");
const { runAggregateSummary, end } = require("../controllers/aggregate");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { AGGREG_TASK_STARTED, AGGREG_TASK_COMPLETED } = messages;
const router = Router();
const axios = require("axios");
const { DateTime } = require("luxon");
const moment = require("moment");

router.post("/", async (req, res) => {
  let request = req.body;
  const reportedDate = DateTime.fromMillis(req.body.DATE_REPORTED);
  request.DATE_REPORTED = moment(reportedDate).format(
    "YYYY-MM-DDTHH:mm:ss.SSSSSS[Z]"
  );
  const options = {
    url: "http://102.220.22.137:8111/rest/v1/ebs_connect",
    method: req.method,
    data: req.body,
    headers: {
      Authorization:
        "Basic c3VwYWJhc2U6Z0c4dml5WmVsZUFYZUI5ZGJtcTg1M05GZVBkSDFa",
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzI3ODE2NDAwLAogICJleHAiOiAxODg1NTgyODAwCn0.xGLBHldwAvyuPZbymuWIbpsIVVUF6FWuv5LeJUXyjTQ", // Add custom header
    }, // Automatically stringify the body to JSON
  };
  axios(options)
    .then((response) => {
      // Send the upstream server's response back to the client
      res.status(response.status).send(response.data);
    })
    .catch((err) => {
      // Handle errors, such as when the upstream server is unreachable
      if (err.response) {
        // If the error response comes from the server
        res.status(err.response.status).send(err.response.data);
      } else {
        // Handle network or Axios-related errors
        res
          .status(500)
          .send({ message: "Error forwarding request", error: err.message });
      }
    });
});

module.exports = router;
