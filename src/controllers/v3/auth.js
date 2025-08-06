const axios = require("axios");
const { HIE } = require("../../../config");
const { logger } = require("../../utils/logger");

class AuthenticatedInstance {
    accesstoken = '';
    tokenPromise = null;
    axiosInstance = null;

    async getToken(forceRefresh = false) {
        if (forceRefresh || !this.tokenPromise) {
            this.tokenPromise = this.fetchToken();
        }
        return this.tokenPromise;
    }

    async fetchToken() {
        const resp = await axios.get(HIE.url + '/v1/hie-auth?key=' + HIE.consumerKey, {
            auth: {
                username: HIE.user,
                password: HIE.pass
            }
        });
        this.accesstoken = resp.data;
        return resp.data;
    }

    instance() {
        // Return axios instance synchronously, but handle token refresh asynchronously
        if (!this.axiosInstance) {
            // Create a base instance first
            this.axiosInstance = axios.create({
                baseURL: HIE.url,
                timeout: 10000
            });

            // Add request interceptor to ensure we have a valid token
            this.axiosInstance.interceptors.request.use(
                async (config) => {
                    const token = await this.getToken();
                    config.headers['Authorization'] = `Bearer ${token}`;
                    return config;
                },
                (error) => Promise.reject(error)
            );

            // Add response interceptor to handle 401s
            this.axiosInstance.interceptors.response.use(
                (response) => response,
                async (error) => {
                    if (error.response && error.response.status === 401) {
                        // Token expired, refresh it
                        const newToken = await this.getToken(true);
                        error.config.headers['Authorization'] = `Bearer ${newToken}`;
                        // Retry the original request
                        return this.axiosInstance.request(error.config);
                    }
                    return Promise.reject(error);
                }
            );
        }
        return this.axiosInstance;
    }
}

module.exports = {
    AuthenticatedInstance
}