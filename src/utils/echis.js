const axios = require("axios");

const genRequestConfig = (conf) => {
    return {
        baseURL: conf.instance,
        auth: {
            username: conf.user,
            password: conf.password,
        }
    }
};

const getDoc = (conf, docId) => {
    return axios.get(`medic/${docId}`, {
        ...genRequestConfig(conf),
        headers: {
            "Content-Type": "application/json",
        },
    });
};


const updateDoc = (conf, docId, fieldStruct) => {
    return getDoc(conf, docId)
        .then((resp) => {
            return new Promise((resolve) => {
                const doc = resp.data;
                Object.keys(fieldStruct).forEach((key) => doc[key] = fieldStruct[key]);
                resolve(doc);
            })
        })
        .then((doc) => {
            return axios.put(
                `medic/${doc._id}`,
                JSON.stringify(doc),
                {
                    ...genRequestConfig(conf),
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            )
        })
};



const createReport = async (conf, report) => {
    return axios.post(`api/v2/records`, report, {
        ...genRequestConfig(conf),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

module.exports = {
    getDoc,
    updateDoc,
    createReport
}