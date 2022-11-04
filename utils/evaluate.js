module.exports = (v, env = {}) => {
  env;
  if (typeof v == "string" && v.includes("${") && v.includes("}")) {
    return eval(`\`${v}\``);
  }
  return v;
};
