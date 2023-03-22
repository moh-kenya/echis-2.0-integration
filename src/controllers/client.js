const axios = require("axios");
const BASE_URL = "https://dhpstagingapi.health.go.ke/";
const qs = require("qs");
const utils = require("../utils/client");

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const searchClientByIdType = async (echisClientDoc) => {
  // const idInformation = getIdInfoFromEchisPayload(echisClientDoc);
  // const idType = idInformation.identificationType;
  // const idNumber = idInformation.identificationNumber
  const res = await axiosInstance.get(
    `partners/registry/search/${echisClientDoc?.identifications[0]?.identificationType}/${echisClientDoc?.identifications[0]?.identificationNumber}`
  );
  if (res.data.clientExists) {
    return res.data.clientExists && res.data.client.clientNumber;
  } else {
    const response = await updateEchisClient(echisClientDoc);
    console.log(response);
    return response;
  }
};

const createClientInRegistry = async (client) => {
  const res = await axiosInstance.post(`partners/registry`, client);
  return res.data.clientNumber;
};

const generateToken = async () => {
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

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const token = await generateToken();
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

const updateEchisClient = async (echisPatientDoc) => {
  // const config = {
  //   method: "put",
  //   maxBodyLength: Infinity,
  //   url: "https://dhpstagingapi.health.go.ke/partners/registry/",
  //   headers: {
  //     Authorization: `Bearer ${tokres.data.clientExistsen}`,
  //     "Content-Type": "application/json",
  //   },
  //   data: data,
  // };
  try {
    const response = await createClientInRegistry(
      JSON.stringify(transformPayload(echisPatientDoc))
    );
    return response;

    //update doc in echis
  } catch (error) {
    console.error(error);
    return error;
  }
};

const transformPayload = (source) => {
  let result = {
    firstName: source.firstName,
    middleName: source.middleName,
    lastName: source.lastName,
    dateOfBirth: source.dateOfBirth,
    maritalStatus: source.maritalStatus || "",
    gender: source.gender,
    occupation: source.occupation || "",
    religion: source.religion || "",
    educationLevel: source.educationLevel || "",
    country: source.country,
    countyOfBirth: source.countyOfBirth,
    isAlive: source.isAlive || true,
    originFacilityKmflCode: source.originFacilityKmflCode || "",
    residence: {
      county: source.residence.county,
      subCounty: source.residence.subCounty,
      ward: source.residence.ward || "",
      village: source.residence.village || "",
      landMark: source.residence.landMark || "",
      address: source.residence.address || "",
    },
    identifications: [
      {
        countryCode: source.identification.countryCode || "",
        identificationType: source.identification.identificationType,
        identificationNumber: source.identificationNumber,
      },
    ],
    contact: {
      primaryPhone: source.contact.primaryPhone,
      secondaryPhone: source.contact.secondaryPhone,
      emailAddress: source.contact.emailAddress || "",
    },
    nextOfKins: [
      {
        name: source.nextOfKin.name,
        relationship: source.nextOfKin.relationship,
        residence: source.nextOfKin.residence,
        contact: {
          primaryPhone: source.nextOfKin.contact.primaryPhone,
        },
      },
    ],
  };
  return result;
};

module.exports = {
  updateEchisClient,
  searchClientByIdType,
};

// const samplePayload = {
//   firstName: "Maina",
//   middleName: "And",
//   lastName: "Kingangi",
//   dateOfBirth: "2022-12-09",
//   maritalStatus: "single",
//   gender: "male",
//   occupation: "other",
//   religion: "christian",
//   educationLevel: "college",
//   country: "KE",
//   countyOfBirth: "042",
//   isAlive: true,
//   originFacilityKmflCode: "15828",
//   residence: {
//     county: "042",
//     subCounty: "kisumu-central",
//     ward: "kondele",
//     village: "kondele",
//     landMark: "kondele",
//     address: "kondele",
//   },
//   identifications: [
//     {
//       countryCode: "KE",
//       identificationType: "national-id",
//       identificationNumber: "ALPDD1232143434",
//     },
//   ],
//   contact: {
//     primaryPhone: "+254700111111",
//     secondaryPhone: "+254700111111",
//     emailAddress: "string@gmail.com",
//   },
//   nextOfKins: [
//     {
//       name: "Cresta Lindt",
//       relationship: "sibling",
//       residence: "kondele",
//       contact: {
//         primaryPhone: "+254700334567",
//       },
//     },
//   ],
// };

//illustration purposes
// const getIdInfoFromEchisPayload = (echisDoc) => {
//   return {
//     identificationType: echisDoc.id_type || "alien-id",
//     identificationNumber: echisDoc.id || "TESTZA12345",
//   };
// };
