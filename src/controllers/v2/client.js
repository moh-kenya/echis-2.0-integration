const axios = require("axios");
const { CLIENT_REGISTRY } = require("../../../config");
const { supportedIDTypes, areSimilar } = require("../../utils/client");

const axiosInstance = axios.create({
  baseURL: CLIENT_REGISTRY.url,
  auth: {
    username: CLIENT_REGISTRY.user,
    password: CLIENT_REGISTRY.pass,
  },
  timeout: 10000,
});

const err = (resp, err) => {
  if (err) throw err;
  let issues = resp.data.message?.issue || resp.data.issue;
  let errString = issues.map((issue) => issue.diagnostics).join(",");
  if (errString.includes("not found")) {
    throw new Error("no matches");
  } else {
    throw new Error(errString);
  }
};

const parseID = (contact) => {
  const idType = contact.identification_type;
  if (idType in supportedIDTypes) {
    return {
      [supportedIDTypes[idType]]: contact.identification_number,
    };
  }
  throw new Error(
    "Invalid identification type: " + contact.identification_type
  );
};

const fetchClientFromRegistry = async (contact) => {
  const params = parseID(contact);
  try {
    const resp = await axiosInstance.get("/api/v4/Patient", {
      params: { ...params },
    });
    return (
      {
        id: resp.data.id,
        name: resp.data.name[0].text,
        date_of_birth: resp.data.birthDate,
        sex: resp.data.gender,
      } ?? err(resp)
    );
  } catch (err) {
    err(err.response, err);
  }
};

const compareAttrs = (contact, client) => {
  const errors = [];
  const contactName = contact.first_name
    .concat(" ", contact.middle_name ?? "", " ", contact.last_name ?? "")
    .trim();
  const attrs = [
    { label: "Date of birth", attr: "date_of_birth" },
    { label: "Gender", attr: "sex" },
  ];
  if (!areSimilar(contactName, client.name)) {
    errors.push("Fullname");
  }
  attrs.forEach((attr) => {
    if (contact[attr.attr] != client[attr.attr]) {
      errors.push(attr.label);
    }
  });
  return errors;
};

module.exports = {
  fetchClientFromRegistry,
  compareAttrs,
};
