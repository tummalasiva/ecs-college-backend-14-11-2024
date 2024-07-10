const objHas = (obj, objFields) => {
  if (!(typeof obj == "object" && Array.isArray(objFields)))
    throw new Error("invalid arguments");
  for (let i = 0; i < objFields.length; i++) {
    if (!obj[objFields[i]]) throw new Error(`provide ${objFields[i]} in body`);
  }
};
const randomNumberRange = (min, max) => {
  const random = Math.random();
  return Math.floor(random * (max - min) + min);
};

const roundNum = (value, precision) => {
  let multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

module.exports = {
  objHas,
  randomNumberRange,
  roundNum,
};
