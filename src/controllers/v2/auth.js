const axios = require("axios");
const { logger } = require("../../utils/logger");
const { HIE } = require("../../../config");

const getToken = async () => {
    const resp = await axios.get(HIE.url + '/v1/hie-auth?key=' + HIE.consumerKey, {
        auth: {
            username: HIE.user,
            password: HIE.pass
        }
    });
    return resp.data;
};

class AuthenticatedInstance {
    accesstoken = '';
    async refresh() {
        while (true) {
            this.accesstoken = await getToken();
            await new Promise(resolve => setTimeout(resolve, 20000));
            logger.info("Re-authenticating");
        }
    }

    constructor() {
        this.refresh();
    }
    
    instance() {
        console.log(this.accesstoken);
        return axios.create({
            baseURL: HIE.url,
            headers: { 'Authorization': `Bearer ${this.accesstoken}` },
            timeout: 10000
        });
    }
}

module.exports = {
    AuthenticatedInstance
}