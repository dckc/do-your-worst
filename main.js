// adapted from https://blog.risingstack.com/your-first-node-js-http-server/

/* global require, console */

const harden = require('@agoric/harden');


function main({ createServer }) {
  console.log('hello from main...');

  const port = 3000;

  const requestHandler = (request, response) => {
    console.log(request.url);
    response.end('Hello Node.js Server!');
  };

  const server = createServer(requestHandler);

  tamper(server);

  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
    return null;
  });
}


function tamper(server) {
  try {
    server.listen = null;
    console.log(`clobbered: ${server.listen}`);
  } catch (err) {
    console.log(`cannot clobber .listen: ${err}`);
  }
}


// value of last expression is "exported"
harden(main);
