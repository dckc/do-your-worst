/* global require */
// @flow

const { SES } = require('ses');

const { asPromise } = require('./asPromise');

async function loader(specifier, { resolve, readFile }) {
  console.log(SES);
  const mainPath = resolve(specifier);
  const code = await asPromise(cb => readFile(mainPath, 'utf-8', cb));
  const s = SES.makeSESRootRealm();
  const req = s.makeRequire({ '@agoric/harden': true });
  const main = s.evaluate(code, { require: req });
  console.log(main);
}


/*global module */
if (require.main === module) {
  loader('./main', {
    resolve: require.resolve,
    readFile: require('fs').readFile,
  });
}
