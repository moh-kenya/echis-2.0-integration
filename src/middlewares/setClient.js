const { getIdentificationType } = require("../utils/client");
const { logger } = require("../utils/logger");

module.exports = function () {
    return async function setClient(req, res, next) {
        const contact = req.body?.doc;
        if (!contact) {
            res.status(400).send("Contact Doc Empty");
            return
        }
        res.locals.contact = contact;
        next()
    }

    next();
  };
};
