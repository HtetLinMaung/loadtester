const axios = require("axios");
const moment = require("moment");

module.exports = async (
  url,
  method = "get",
  query = {},
  body = {},
  headers = {},
  options = {}
) => {
  let errMessage = "";
  let stack = "";
  const start = moment();
  let res = null;
  let success = true;
  try {
    const defaultOptions = { ...options, headers, params: query };
    if (method == "get" || method == "delete") {
      res = await axios[method](url, defaultOptions);
    } else {
      res = await axios[method](url, body, defaultOptions);
    }
  } catch (err) {
    // console.log(err.message);
    errMessage = err.message;
    stack = err.stack;
    res = err.response;
    success = false;
  }
  const duration = moment.duration(moment().diff(start)).asSeconds();
  return {
    success,
    duration,
    response: res ? res.data : null,
    errMessage,
    stack,
  };
};
