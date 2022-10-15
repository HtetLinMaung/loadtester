const { brewBlankExpressFunc } = require("code-alchemy");
const { finished } = require("../constants");

module.exports = brewBlankExpressFunc(async (req, res) => {
  const results = finished[req.query.name];

  const durations = results.map((r) => r.duration);
  const successCounts = results.filter((r) => r.success).length;
  const failCounts = results.filter((r) => !r.success).length;

  const data = {
    name: req.query.name,
    min: Math.min(...durations),
    max: Math.max(...durations),
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    successCounts,
    failCounts,
    // successPercent: (successCounts / v.t) * 100,
    // failPercent: (failCounts / v.t) * 100,
  };
  res.json({
    code: 200,
    message: "Successful",
    data,
  });
});
