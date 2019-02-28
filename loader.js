/* global require, exports */
// @flow

const { SES } = require('ses');

const { asPromise } = require('./asPromise');

const { freeze } = Object;


exports.Loader = Loader;
function Loader(opts, { resolve, readFile }) {
  const s = SES.makeSESRootRealm(opts);
  const req = s.makeRequire({ '@agoric/harden': true });

  async function load(specifier) {
    const mainPath = resolve(specifier);
    const code = await asPromise(cb => readFile(mainPath, 'utf-8', cb));

    return s.evaluate(code, { require: req });
  }

  return freeze({ load, realm: s, require: req });
}
