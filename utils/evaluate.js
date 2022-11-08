let roundRobinState = {};
function roundRobin(array = [], key = "i") {
  if (!(key in roundRobinState)) {
    roundRobinState[key] = 0;
  }
  return array[roundRobinState[key]++ % array.length];
}

let randomState = {};
function random(array = [], key = "i") {
  randomState[key] = Math.round(Math.random() * array.length);
  return array[randomState[key]];
}

module.exports = (v, env = {}) => {
  try {
    random;
    roundRobin;
    env;
    if (typeof v == "string" && v.includes("${") && v.includes("}")) {
      return eval(`\`${v}\``);
    }
    return v;
  } catch (err) {
    return err.message;
  }
};
