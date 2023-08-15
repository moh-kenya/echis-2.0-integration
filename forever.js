const forever = require("forever-monitor");
const { logger } = require("./src/utils/logger");
var child = new forever.Monitor("index.js", {
  silent: false,
  args: [],
});

child.on("exit", function () {
  logger.information("Service has exited after 10 restarts");
});
child.on("watch:restart", function (info) {
  logger.error("Restarting Service because " + info.file + " changed");
});

child.on("restart", function () {
  logger.error("Forever restarting Service for " + child.times + " time");
});
child.on("start", function () {
  logger.information("Service is starting");
});
child.start();
