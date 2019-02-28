/* global require */
// @flow


const { Loader } = require('./loader');

/**
 * "Wrapping endowments like this is critical for security, because
 * the simple approach would reveal an outer-realm object to the
 * confined code, which it could use to escape confinement"
 * -- https://github.com/Agoric/SES/issues/67#issuecomment-466705822
 */
function _createServer(loader, { http }) {
  const { realm, require } = loader;
  return realm.evaluate(`(${wrapCreateServer})()`, {
    require,
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


/*global module */
if (require.main === module) {
  // Only access ambient authority (e.g. fs) when invoked as script.

  const ld = Loader({ consoleMode: 'allow' }, {
    resolve: require.resolve,
    readFile: require('fs').readFile,
  });

  ld.load('./main').then(main => {
    main({
      createServer: _createServer(ld, { http: require('http') }),
    });
  });
}
