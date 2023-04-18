const counties = [
  { code: 1, name: 'Mombasa' },
  { code: 2, name: 'Kwale' },
  { code: 3, name: 'Kilifi' },
  { code: 4, name: 'Tana River' },
  { code: 5, name: 'Lamu' },
  { code: 6, name: 'Taita Taveta' },
  { code: 7, name: 'Garissa' },
  { code: 8, name: 'wajir' },
  { code: 9, name: 'Mandera' },
  { code: 10, name: 'Marsabit' },
  { code: 11, name: 'Isiolo' },
  { code: 12, name: 'Meru' },
  { code: 13, name: 'Tharaka Nithi' },
  { code: 14, name: 'Embu' },
  { code: 15, name: 'Kitui' },
  { code: 16, name: 'Machakos' },
  { code: 17, name: 'Makueni' },
  { code: 18, name: 'Nyandarua' },
  { code: 19, name: 'Nyeri' },
  { code: 20, name: 'Kirinyaga' },
  { code: 21, name: "Murang'a" },
  { code: 22, name: 'Kiambu' },
  { code: 23, name: 'Turkana' },
  { code: 24, name: 'West Pokot' },
  { code: 25, name: 'Samburu' },
  { code: 26, name: 'Trans Nzoia' },
  { code: 27, name: 'Uasin Gishu' },
  { code: 28, name: 'Elgeyo Marakwet' },
  { code: 29, name: 'Nandi' },
  { code: 30, name: 'Baringo' },
  { code: 31, name: 'Laikipia' },
  { code: 32, name: 'Nakuru' },
  { code: 33, name: 'Narok' },
  { code: 34, name: 'Kajiado' },
  { code: 35, name: 'Kericho' },
  { code: 36, name: 'Bomet' },
  { code: 37, name: 'Kakamega' },
  { code: 38, name: 'Vihiga' },
  { code: 39, name: 'Bungoma' },
  { code: 40, name: 'Busia' },
  { code: 41, name: 'Siaya' },
  { code: 42, name: 'Kisumu' },
  { code: 43, name: 'Homa Bay' },
  { code: 44, name: 'Migori' },
  { code: 45, name: 'Kisii' },
  { code: 46, name: 'Nyamira' },
  { code: 47, name: 'Nairobi' }
];

const idMap = {
  national_id: 'national-id',
  birth_certificate: 'birth-certificate',
  passport: 'passport',
  alien_card: 'alien-id',
};

const generateClientRegistryPayload = (echisDoc) => {
  const nameArray = echisDoc?.doc?.name.split(' ');
  let result = {
    firstName: echisDoc?.doc?.first_name || nameArray.at(0),
    middleName: echisDoc?.doc?.middle_name ||  nameArray.at(1),
    lastName: echisDoc?.doc?.last_name || nameArray.at(2),
    dateOfBirth: echisDoc?.doc?.date_of_birth,
    maritalStatus: echisDoc?.doc?.marital_status || '',
    gender: echisDoc?.doc?.sex,
    occupation: echisDoc?.doc?.occupation || '',
    religion: echisDoc?.doc?.religion || '',
    educationLevel: echisDoc?.doc?.education_level || '',
    country: echisDoc?.doc?.nationality || 'KE',
    countyOfBirth: echisDoc?.country_of_birth || 'county-n-a',
    isAlive: true,
    originFacilityKmflCode: echisDoc?.doc?.parent?.parent?.link_facility_code || '',
    residence: {
      county: transformCountyCode(echisDoc?.doc?.county_of_residence) ||
        transformCountyCode(`${counties.find(county =>  county.name === echisDoc?.doc?.parent?.parent?.parent?.parent?.parent?.name.trim().replace('County', '')).code}`),
      subCounty: echisDoc?.doc?.subcounty || echisDoc?.doc?.parent?.parent?.parent?.name.trim().replaceAll(' ', '-').toLowerCase(),
      ward: echisDoc?.doc?.ward || '',
      village: echisDoc?.doc?.village || '',
      landMark: echisDoc?.doc?.land_mark || '',
      address: echisDoc?.doc?.address || '',
    },
    identifications: [
      {
        countryCode: echisDoc?.doc?.country_code || 'KE',
        identificationType: idMap[echisDoc?.doc?.identification_type] || 'national-id',
        identificationNumber: echisDoc?.doc?.identification_number,
      },
    ],
    contact: {
      primaryPhone: echisDoc?.doc?.phone,
      secondaryPhone: echisDoc?.doc?.alternate_phone,
      emailAddress: echisDoc?.doc?.email_address || '',
    },
    nextOfKins: [
      {
        name: echisDoc?.doc?.next_of_kin || echisDoc?.doc?.parent.contact.name,
        relationship: echisDoc?.doc?.relationship_with_next_of_kin || echisDoc?.doc?.relationship_to_hh_head,
        residence: echisDoc?.doc?.next_of_kin_residence,
        contact: {
          primaryPhone: echisDoc?.doc?.next_of_kin_phone || echisDoc?.doc?.parent.contact.phone,
          secondaryPhone: echisDoc?.doc?.next_of_kin_alternate_phone || echisDoc?.doc?.parent.contact.alternate_phone,
          emailAddress: echisDoc?.doc?.next_of_kin_email || echisDoc?.doc?.parent.contact.email_address || '',
        },
      },
    ],
  };
  console.log(JSON.stringify(result));
  return result;
};

const transformCountyCode = (code) => {
  return code ? code.padStart(3, '0') : 'county-n-a';
};

module.exports = {
  idMap,
  generateClientRegistryPayload,
};
