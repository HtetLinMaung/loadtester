const { timeout } = require("starless-async");
const injectFake = require("./inject-fake");
const request = require("./request");

module.exports = async (json = {}, resCb = () => {}, cb = () => {}) => {
  const items = [];
  for (const [endpointName, v] of Object.entries(json.endpoints)) {
    const promises = [];

    const n = v.n || v.t;

    if ("steps" in v) {
      for (let i = 0; i < v.t; i++) {
        if (promises.length % n == 0) {
          await timeout(1);
        }
        promises.push(async () => {
          const state = {};
          let count = 1;
          let finalResult = {
            success: false,
            duration: 0,
            response: null,
            errMessage: "",
            stack: "",
          };
          for (const step of v.steps) {
            const url = `${json.domain}${step.path}`;
            const headers = step.headers || {};
            const body = step.body || {};
            const query = step.query || {};

            const result = await request(
              url,
              step.method,
              injectFake(query, { state }),
              injectFake(body, { state }),
              injectFake(headers, { state })
            );
            state[`$${count++}`] = result.response;
            finalResult = {
              success: finalResult.success && result.success,
              duration: finalResult.duration + result.duration,
              response: result.response,
              errMessage: result.errMessage,
              stack: result.stack,
            };
          }
          return finalResult;
        });
      }
    } else {
      const url = `${json.domain}${v.path}`;
      const headers = v.headers || {};
      const body = v.body || {};
      const query = v.query || {};

      for (let i = 0; i < v.t; i++) {
        if (promises.length % n == 0) {
          await timeout(1);
        }
        if (Array.isArray(body)) {
          for (const b of body) {
            promises.push(
              request(
                url,
                v.method,
                injectFake(query),
                injectFake(b),
                injectFake(headers)
              )
            );
          }
        } else {
          promises.push(
            request(
              url,
              v.method,
              injectFake(query),
              injectFake(body),
              injectFake(headers)
            )
          );
        }
      }
    }

    const results = [];
    for (const promise of promises) {
      const result = await promise;
      //   console.log(result);
      results.push(result);
      resCb(result, endpointName);
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
