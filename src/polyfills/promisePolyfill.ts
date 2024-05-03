// https://github.com/ltsSmitty/OpenRCT2-Simple-Typescript-Template-Async/blob/main/src/polyfills/promisePolyfill.ts

//@ts-nocheck

/**
 * This polyfill, plus some bundle and compilation settings, allows the use of Promise and async
 * in your plugin code. See usage in [nextTick.ts](./nextTick.ts)
 */
function PromisePolyfill(executor) {
  let onResolve, onReject;
  let fulfilled = false,
    rejected = false,
    called = false,
    value;

  function resolve(v) {
    fulfilled = true;
    value = v;

    if (typeof onResolve === "function") {
      console.log("HELLO");
      onResolve(value);
      called = true;
    }
  }

  function reject(reason) {
    rejected = true;
    value = reason;

    if (typeof onReject === "function") {
      onReject(value);
      called = true;
    }
  }

  this.then = function (callback) {
    onResolve = callback;

    if (fulfilled && !called) {
      called = true;
      onResolve(value);
    }
    return this;
  };

  this.catch = function (callback) {
    onReject = callback;

    if (rejected && !called) {
      called = true;
      onReject(value);
    }
    return this;
  };

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

PromisePolyfill.resolve = (val) =>
  new PromisePolyfill(function executor(resolve, _reject) {
    resolve(val);
  });

PromisePolyfill.reject = (reason) =>
  new PromisePolyfill(function executor(resolve, reject) {
    reject(reason);
  });

PromisePolyfill.all = (promises) => {
  let fulfilledPromises = [],
    result = [];

  function executor(resolve, reject) {
    promises.forEach((promise, index) =>
      promise
        .then((val) => {
          fulfilledPromises.push(true);
          result[index] = val;

          if (fulfilledPromises.length === promises.length) {
            return resolve(result);
          }
        })
        .catch((error) => {
          return reject(error);
        })
    );
  }
  return new PromisePolyfill(executor);
};

export { PromisePolyfill };