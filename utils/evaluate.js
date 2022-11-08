let roundRobinState = {};
function roundRobin(array = [], key = "i") {
  if (!(key in roundRobinState)) {
    roundRobinState[key] = 0;
  }
  return array[roundRobinState[key]++ % array.length];
}

module.exports = (v, env = {}) => {
  try {
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
