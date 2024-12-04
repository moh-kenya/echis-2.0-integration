const axios = require("axios");
const { logger } = require("../../utils/logger");
const { HIE } = require("../../../config");

const getToken = async () => {
    const resp = await axios.get(HIE.url + '/v1/hie-auth?key=echis', {
        auth: {
            username: HIE.user,
            password: HIE.pass
        }
    });
    return resp.data;
};

const reauthenticate = async (axiosInstance, error) => {
    if (error.response.status !== 401) {
        return Promise.reject(error);
    }
    const originalRequest = error.config;
    if (originalRequest._retry) {
        return Promise.reject(error);
    }
    logger.information("Re-authenticating");
    try {
        originalRequest._retry = true;
        const token = await getToken();
        delete(originalRequest.headers.Authorization);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return axiosInstance(originalRequest);
    } catch (err) {
        logger.error(`could not reauthenticate: ${err}`);
    }
    return Promise.reject(error);
}

module.exports = {
    reauthenticate
}