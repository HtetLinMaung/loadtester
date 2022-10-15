const { brewBlankExpressFunc } = require("code-alchemy");
const testLoad = require("../utils/test-load");
const server = require("starless-server");
const { v4 } = require("uuid");
const { finished } = require("../constants");

module.exports = brewBlankExpressFunc(async (req, res) => {
  const io = server.default.getIO();

  const data = await testLoad(
    req.body,
    (result, name) => {
      io.emit("result", {
        result,
        ref: req.body.ref || v4(),
      });
      if (!(name in finished)) {
        finished[name] = [result];
      } else {
        finished[name].push(result);
      }
    },
    (results, item) => {
      io.emit("item", {
        results,
        item,
        ref: req.body.ref || v4(),
      });
      finished[item.name] = [];
      // item["results"] = results;
    }
  );

  res.json({
    code: 200,
    message: "Test complete",
    data,
  });
});
