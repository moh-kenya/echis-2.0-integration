const { supportedIDTypes, areSimilar } = require("../../utils/client");
const { getDoc, genRequestConfig } = require("../../utils/echis");
const { AuthenticatedInstance } = require("./auth");
const authenticatedInstance = new AuthenticatedInstance();

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
      identifierType: supportedIDTypes[idType],
      identifierNumber: contact.identification_number
    };
  }
  throw new Error(
    "Client has an invalid identification type: " + contact.identification_type
  );
};

const fetchClientFromRegistry = async (contact) => {
  const params = parseID(contact);
  try {
    const resp = await authenticatedInstance.instance().get("/v1/fhir/Patient", {
      params: { ...params },
    });
    if (resp.data.total <= 0) {
      throw new Error("client not found");
    }
    const client = resp.data.entry[0].resource;
    return (
      {
        id: client.id,
        name: client.name[0].text,
        date_of_birth: client.birthDate,
        sex: client.gender,
      } ?? err(resp)
    );
  } catch (error) {
    err(error.response, error);
  }
};

const updateContactUPI = (conf, docId, obj) => {
  return getDoc(conf, docId)
    .then((resp) => {
      const doc = resp.data;
      if (doc.upi && !doc.cr_hie_id) {
        doc.moh_upi = doc.upi;
      }
      return doc;
    })
    .then((doc) => {
      return new Promise((resolve) => {
        Object.keys(obj).forEach((key) => (doc[key] = obj[key]));
        resolve(doc);
      });
    })
    .then((doc) => {
      return axios.put(`medic/${doc._id}`, JSON.stringify(doc), {
        ...genRequestConfig(conf),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
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
  if (!areSimilar(contactName.toLowerCase(), client.name.toLowerCase())) {
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
  updateContactUPI
};
