const axios = require("axios");
const BASE_URL = "https://dhpstagingapi.health.go.ke/";
const {generateToken} = require("../utils/auth");
const qs = require("qs");
const utils = require("../utils/client");

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const searchClientByIdType = async (echisClientDoc) => {
  try {
    let identificationType;
    if (echisClientDoc?.identifications?.identificationType === "national_id") {
      identificationType = "national_id";
    } else {
      identificationType = echisClientDoc?.identifications?.identificationType;
    }
    const res = await axiosInstance.get(
      `partners/registry/search/${identificationType}/${echisClientDoc?.identifications?.identificationNumber}`
    );
    if (res.data.clientExists) {
      return res.data.clientExists && res.data.client.clientNumber;
    } else {
      const response = await updateEchisClient(echisClientDoc);
      console.log(response);
      return response;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

const createClientInRegistry = async (client) => {
  const res = await axiosInstance.post(`partners/registry`, client);
  return res.data.clientNumber;
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
      JSON.stringify(utils.generateClientRegistryPayload(echisPatientDoc))
    );
    return response;

    //update doc in echis
  } catch (error) {
    console.error(error);
    return error;
  }
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
