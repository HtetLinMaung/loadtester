const axios = require("axios");
const moment = require("moment");

module.exports = async (
  url,
  method = "get",
  query = {},
  body = {},
  headers = {}
) => {
  let errMessage = "";
  let stack = "";
  const start = moment();
  let res = null;
  let success = true;
  try {
    if (method == "get") {
      res = await axios.get(url, { headers, params: query });
    } else if (method == "delete") {
      res = await axios.delete(url, { headers, params: query });
    } else {
      res = await axios[method](url, body, {
        headers,
        params: query,
      });
    }
  } catch (err) {
    console.log(err.message);
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
