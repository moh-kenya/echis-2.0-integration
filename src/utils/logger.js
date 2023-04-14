const logger = {

    information : (message) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        console.info(`${timestamp} \x1b[32mINFO:\x1b[0m ${message};`);
    },

    warning : (message) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        console.warn(`${timestamp} \x1b[33mWARNING:\x1b[0m ${message};`);
    },

    error : (message) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        console.error(`${timestamp} \x1b[31mERROR:\x1b[0m ${message};`);
    }
}
module.exports = {
    logger
};
  