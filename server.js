/* global require */
// @flow

const { SES } = require('ses');

async function loader(specifier, { resolve, readFile }) {
  console.log(SES);
  const mainPath = resolve(specifier);
  const code = await asPromise(cb => readFile(mainPath, 'utf-8', cb));
  const s = SES.makeSESRootRealm();
  const req = s.makeRequire({ '@agoric/harden': true });
  const main = s.evaluate(code, { require: req });
  console.log(main);
}


/*
 * Adapt callback-style API using Promises.
 *
 * Instead of obj.method(...arg, callback),
 * use send(cb => obj.method(...arg, cb)) and get a promise.
 *
 * @param calling: a function of the form (cb) => o.m(..., cb)
 * @return A promise for the result passed to cb
 */
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


/*global module */
if (require.main === module) {
  loader('./main', {
    resolve: require.resolve,
    readFile: require('fs').readFile,
  });
}
