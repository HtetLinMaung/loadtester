module.exports = (v, env = {}) => {
  try {
    env;
    if (typeof v == "string" && v.includes("${") && v.includes("}")) {
      return eval(`\`${v}\``);
    }
    return v;
  } catch (err) {
    return err.message;
  }
};
