const getGender = () => {
  const genderOptions = ["male", "female", "unspecified", "intersex"];
  return genderOptions[Math.floor(Math.random() * genderOptions.length)];
};
module.exports = getGender;
