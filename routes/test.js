const { brewBlankExpressFunc } = require("code-alchemy");
const testLoad = require("../utils/test-load");
const server = require("starless-server");
const { v4 } = require("uuid");

module.exports = brewBlankExpressFunc(async (req, res) => {
  const io = server.default.getIO();

  const data = await testLoad(
    req.body,
    (result) => {
      io.emit("result", {
        result,
        ref: req.body.ref || v4(),
      });
    },
    (results, item) => {
      io.emit("item", {
        results,
        item,
        ref: req.body.ref || v4(),
      });
      item["results"] = results;
    }
  );
  res.json({
    code: 200,
    message: "Test complete",
    data,
  });
});
