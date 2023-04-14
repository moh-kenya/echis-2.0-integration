const logger = {

    information : (message) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        console.info(`${timestamp} INFO: ${message};`);
    },

    warning : (message) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        console.warn(`${timestamp} WARNING: ${message};`);
    },

    error : (message) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        console.error(`${timestamp} ERROR: ${message};`);
    }
}
module.exports = {
    logger
};
  