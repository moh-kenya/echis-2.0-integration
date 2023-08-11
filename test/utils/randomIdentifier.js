const getIdentifier = () => {
  const identifierTypes = ["national_id", "passport", "birth_certificate"];
  return identifierTypes[Math.floor(Math.random() * identifierTypes.length)];
};
module.exports = getIdentifier;
