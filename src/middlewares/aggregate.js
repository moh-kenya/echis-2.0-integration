const cron = require("node-cron");
const axios = require("axios");
const { MEDIATOR, OPENHIM } = require("../../config");
const { logger } = require("../utils/logger");
const { messages } = require("../utils/messages");
const { RUNNING_DHIS_515_EXPORT } = messages;

const cronService = () =>
  cron.schedule("*/5 * * * *", () => {
    logger.information(RUNNING_DHIS_515_EXPORT);
    try {
      const res = axios.get(
        `${MEDIATOR.url}/${OPENHIM.channel}/aggregate/run`,
        {
          auth: { username: MEDIATOR.username, password: MEDIATOR.password },
        }
      );
      return res;
    } catch (error) {
      logger.error(error);
      return error;
    }
  });

module.exports = {
  cronService,
};
