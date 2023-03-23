const qs = require("qs");
const axios = require("axios");

const token = {
  timestamp: null,
  value: null,
}

const requestNewToken = async () => {
  const data = qs.stringify({
    client_id: "partner.test.client",
    client_secret: "partnerTestPwd",
    grant_type: "client_credentials",
    scope: "DHP.Gateway DHP.Partners",
  });

  const config = {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const res = await axios.post(
    `${process.env.CLIENT_REGISTRY_URL}/connect/token`,
    data,
    config
  );
  return res.data.access_token;
};

const generateToken = async () => {
  if (token.timestamp && token.value) {
    const now = new Date();
    const diff = now - token.timestamp;
    if (diff < 36000000) { // 10 hours
      return token.value;
    } else {
      token.value = await requestNewToken();
      token.timestamp = new Date();
      return token.value;
    }
  } else {
    token.value = await requestNewToken();
    token.timestamp = new Date();
    return token.value;
  }
};

module.exports = {
  generateToken,
};
