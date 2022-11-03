const { faker } = require("@faker-js/faker");

const injectFake = (obj = {}) => {
  let newObj = {};
  for (const [k, v] of Object.entries(obj)) {
    newObj[k] = typeof v == "string" && v.includes("faker.") ? eval(v) : v;
  }
  return newObj;
};
faker;
module.exports = injectFake;
