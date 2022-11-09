const { timeout } = require("starless-async");
const injectFake = require("./inject-fake");
const request = require("./request");

module.exports = async (json = {}, resCb = () => {}, cb = () => {}) => {
  const items = [];
  const globalHeaders = json.headers || {};
  const globalBody = json.body || {};
  const globalQuery = json.query || {};
  const globalOptions = json.options || {};
  for (const [endpointName, v] of Object.entries(json.endpoints)) {
    const promises = [];

    const n = v.n || v.t;

    if ("steps" in v) {
      for (let i = 0; i < v.t; i++) {
        if (promises.length % n == 0) {
          await timeout(1);
        }
        promises.push(
          (async () => {
            const state = {};
            let finalResult = {
              success: true,
              duration: 0,
              response: null,
              errMessage: "",
              stack: "",
            };

            for (const [j, step] of v.steps.entries()) {
              const url = `${json.domain}${step.path}`;
              const headers = injectFake(
                {
                  ...globalHeaders,
                  ...(v.headers || {}),
                  ...(step.headers || {}),
                },
                { state }
              );
              const body = injectFake(
                {
                  ...globalBody,
                  ...(v.body || {}),
                  ...(step.body || {}),
                },
                { state }
              );
              const query = injectFake(
                {
                  ...globalQuery,
                  ...(v.query || {}),
                  ...(step.query || {}),
                },
                { state }
              );
              const options = injectFake(
                {
                  ...globalOptions,
                  ...(v.options || {}),
                  ...(step.options || {}),
                },
                { state }
              );

              state[`$${j + 1}_headers`] = headers;
              state[`$${j + 1}_body`] = body;
              const result = await request(
                url,
                step.method,
                query,
                body,
                headers,
                options
              );
              state[`$${j + 1}`] = result.response;

              finalResult = {
                success: finalResult.success && result.success,
                duration: finalResult.duration + result.duration,
                response: result.response,
                errMessage: result.errMessage,
                stack: result.stack,
              };
            }
            return finalResult;
          })()
        );
      }
    } else {
      const url = `${json.domain}${v.path}`;
      const headers = { ...globalHeaders, ...(v.headers || {}) };
      const body = { ...globalBody, ...(v.body || {}) };
      const query = { ...globalQuery, ...(v.query || {}) };
      const options = { ...globalOptions, ...(v.options || {}) };

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
                injectFake(headers),
                injectFake(options)
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
              injectFake(headers),
              injectFake(options)
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
