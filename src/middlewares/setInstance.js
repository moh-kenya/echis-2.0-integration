const { logger } = require("../utils/logger");

module.exports = function (instanceValue) {
    return setInstance=(req, res, next) => {
        if (req.headers['x-openhim-clientid']) {
          const clientId = req.headers['x-openhim-clientid'];
          if (clientId === 'echis') {
            res.locals.instanceValue = "STAGING";
          } else {
            res.locals.instanceValue = clientId;
          }
        } else {
          res.locals.instanceValue = "STAGING";
        }
        logger.information(`Setting instance value to: ${res.locals.instanceValue}`);
        next();
      };
}