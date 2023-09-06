const forever = require("forever-monitor");
const { logger } = require("./src/utils/logger");
const { messages } = require("./src/utils/messages");
const {
  EXIT_AFTER_X_RUNS,
  START_SERVICE,
  FILES_CHANGED,
  RESTART_AFTER_FAILURE,
} = messages;

const child = new forever.Monitor("index.js", {
  silent: false,
  args: [],
});

child.on("exit", function () {
  logger.information(EXIT_AFTER_X_RUNS);
});

child.on("watch:restart", function (info) {
  logger.error(FILES_CHANGED + info.file);
});

child.on("restart", function () {
  logger.error(RESTART_AFTER_FAILURE + child.times);
});

child.on("start", function () {
  logger.information(START_SERVICE);
});

child.start();
