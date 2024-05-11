// Adapted from https://github.com/ltsSmitty/OpenRCT2-Simple-Typescript-Template-Async/blob/main/src/polyfills/promisePolyfill.ts
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

// @ts-nocheck

/**
 * This polyfill, plus some bundle and compilation settings, allows the use of Promise and async
 * in your plugin code. See usage in [nextTick.ts](./nextTick.ts)
 */
function PromisePolyfill<T>(executor : (resolve : (value : T) => void, reject : (reason : any) => void) => void) {
  let onResolve, onReject;
  let fulfilled = false, // Function successfully finished running
    rejected = false, // Function failed to finish running
    called = false, // Function was called
    currValue : T;

    function resolve(value : T) : void {
      if (!fulfilled && !rejected) {
        fulfilled = true;
        currValue = value;
      }

      if (typeof onResolve === 'function' && !called) {
        onResolve(currValue);
        called = true;
      }
    }

    function reject(reason : any) : void {
      if (!fulfilled && !rejected) {
        rejected = true;
        currValue = reason;
      }

      if (typeof onReject === 'function' && !called) {
        onReject(currValue);
        called = true;
      }
    }

    this.then = function (callback : Function) : PromisePolyfill<T> {
      if (fulfilled && !rejected && !called) {
        called = true;
        try {
          return PromisePolyfill.resolve(callback(currValue));
        } catch (error) {
          return PromisePolyfill.reject(error);
        }
      } else {
        return this;
      }
    }

    this.catch = function (callback : Function) : PromisePolyfill<T> {
      if (rejected && !fulfilled && !called) {
        called = true;
        try {
          return PromisePolyfill.resolve(callback(currValue));
        } catch (error) {
            return PromisePolyfill.reject(error);
        }
      } else {
        return this;
      }
    }

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

PromisePolyfill.resolve = (value : T) : PromisePolyfill<T> => {
  return new PromisePolyfill((resolve, _) => {
    resolve(value);
  });
}

PromisePolyfill.reject = (reason : any) : PromisePolyfill<T> => {
  return new PromisePolyfill((_, reject) => {
    reject(reason);
  });
}

PromisePolyfill.all = (promises : Promise[]) : PromisePolyfill<T[]> => {
  if (promises.length === 0) {
    return Promise.resolve();
  }

  const fulfilledPromises = [];
  let results = [];

  return new PromisePolyfill((resolve, reject) => {
    promises.forEach((promise : PromisePolyfill<T>, index : number) : void => {
      promise.then((value : T) => {
        fulfilledPromises.push(true);
        results[index] = value;

        if (fulfilledPromises.length === promises.length) {
          return resolve(results);
        }
      }).catch((error) => {
        return reject(error);
      });
    });
  });
}

export { PromisePolyfill };