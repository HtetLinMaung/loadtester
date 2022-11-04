const { faker } = require("@faker-js/faker");
const evaluate = require("./evaluate");

const injectFake = (obj = {}, env = {}) => {
  let newObj = {};
  for (const [k, v] of Object.entries(obj)) {
    newObj[k] = evaluate(v, { ...env, faker });
  }
  return newObj;
};

module.exports = injectFake;

// console.log(
//   injectFake({ amount: "${parseFloat(faker.finance.amount())} Ks" })
// );
