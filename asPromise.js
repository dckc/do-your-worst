/* global exports */
// @flow

/*
 * Adapt callback-style API using Promises.
 *
 * Instead of obj.method(...arg, callback),
 * use send(cb => obj.method(...arg, cb)) and get a promise.
 *
 * @param calling: a function of the form (cb) => o.m(..., cb)
 * @return A promise for the result passed to cb
 */
exports.asPromise = asPromise;
function asPromise/*:: <T>*/(calling) /*: Promise<T> */{
  function executor(resolve, reject) {
    const callback = (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    };

    calling(callback);
  }

  return new Promise(executor);
}
