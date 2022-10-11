const { timeout } = require("starless-async");
const request = require("./request");

module.exports = async (json = {}, resCb = () => {}, cb = () => {}) => {
  const items = [];
  for (const [endpointName, v] of Object.entries(json.endpoints)) {
    const url = `${json.domain}${v.path}`;
    const headers = v.headers || {};
    const body = v.body || {};
    const query = v.query || {};
    const n = v.n || v.t;

    const promises = [];
    for (let i = 0; i < v.t; i++) {
      if (promises.length % n == 0) {
        await timeout(1);
      }
      if (Array.isArray(body)) {
        for (const b of body) {
          promises.push(request(url, v.method, query, b, headers));
        }
      } else {
        promises.push(request(url, v.method, query, body, headers));
      }
    }

    const results = [];
    for (const promise of promises) {
      const result = await promise;
      //   console.log(result);
      results.push(result);
      resCb(result);
    }

    const durations = results.map((r) => r.duration);
    const successCounts = results.filter((r) => r.success).length;
    const failCounts = results.filter((r) => !r.success).length;

    const item = {
      name: endpointName,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      successCounts,
      failCounts,
      successPercent: (successCounts / v.t) * 100,
      failPercent: (failCounts / v.t) * 100,
    };
    // console.log(item);
    items.push(item);
    cb(results, item);
  }
  return items;
};
