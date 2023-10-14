const { logger } = require("../utils/logger");

module.exports = function () {
    return setInstance=(req, res, next) => {
        if (req.headers['x-openhim-clientid']) {
          const clientId = req.headers['x-openhim-clientid'];
            res.locals.instanceValue = clientId;
        } else {
          res.status(400).send({ error: "Required Headers were not passed"})
        }
        next();
      };
}