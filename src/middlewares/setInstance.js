const { logger } = require("../utils/logger");

module.exports = function () {
  return async function setInstance(req, res, next) {
    if (process.env.ENV === "dev") {
      res.locals.instanceValue = "local";
    } else {
      if (req.headers["x-openhim-clientid"]) {
        const clientId = req.headers["x-openhim-clientid"];
        res.locals.instanceValue = clientId;
      } else {
        res.status(400).send({ error: "Required Headers were not passed" });
      }
    }
    next();
  };
};
