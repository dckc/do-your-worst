/* global require */
// @flow

const urlMod = require('url');

const { Loader } = require('./loader');

/**
 * "Wrapping endowments like this is critical for security, because
 * the simple approach would reveal an outer-realm object to the
 * confined code, which it could use to escape confinement"
 * -- https://github.com/Agoric/SES/issues/67#issuecomment-466705822
 */
function _createServer(loader, { http }) {
  const { realm } = loader;
  return realm.evaluate(`(${wrapCreateServer})()`, {
    require: realm.makeRequire({ '@agoric/harden': true }),
    CREATE: http.createServer,
  });

  const CREATE = () => null; // dummy static binding
  function wrapCreateServer() {
    const harden = require('@agoric/harden');

    function createServer(h) {
      const server = CREATE(h);
      return harden({
        on(...args) { server.on(...args); },
        listen(...args) { server.listen(...args); },
      });
    }
    return harden(createServer);
  }
}


function _url() {
  return {
    attenuatorSource: `${makeUrlModule}`,
    url: urlMod
  };

  function makeUrlModule(cfgVal) {
    const { url } = cfgVal;
    return {
      parse: (...args) => Object.freeze(url.parse(...args))
    };
  };
}



/*global module */
if (require.main === module) {
  // Only access ambient authority (e.g. fs) when invoked as script.

  const ld = Loader({ consoleMode: 'allow' }, {
    resolve: require.resolve,
    readFile: require('fs').readFile,
  });

  ld.load('./main', { url: _url() }).then(main => {
    main({
      createServer: _createServer(ld, { http: require('http') }),
    });
  });
}
