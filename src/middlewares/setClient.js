const { getIdentificationType } = require("../utils/client");
const { logger } = require("../utils/logger");

module.exports = function (axiosInstance) {
    return async function setClient(req, res, next) {
        const contactDoc = req.body?.doc;
        if (!contactDoc) {
            res.status(400).send("Contact Doc Empty");
            return
        }
        if (contactDoc?.upi) {
            res.status(304).send();
            return
        }

        res.locals.echisClient = contactDoc;
        const idType = getIdentificationType(contactDoc.identification_type);
        const crSearchURL = `partners/registry/search/${idType}/${contactDoc.identification_number}`
        try {
            const response = await axiosInstance.get(crSearchURL);
            res.locals.crClientExists = response.data?.clientExists;
            res.locals.crClient = response.data?.client;
        } catch (err) {
            logger.error(`Error while searching Client Registry: ${err.message}`);
            res.status(400).send('err while searching client registry');
            return;
        }

        next()
    }

    next();
  };
};
