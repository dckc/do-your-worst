// adapted from https://blog.risingstack.com/your-first-node-js-http-server/

/* global require, console, SES */

const harden = require('@agoric/harden');
const { parse } = require('url');


function main({ createServer }) {
  console.log('hello from main...');

  const port = 3000;

  const server = createServer(doYourWorst);

  tamper(server);

  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
    return null;
  });
}


const page = `
<!doctype html><html><head>
<title>Do Your Worst!</title>
</head>
<body>
<h1>Do Your Worst!</h1>
<form action='GET'>

<p>What js code would you like me to evaluate?</p>
<textarea cols='50' rows='15' name='code'>

</textarea>
<br />
<input type='submit' name='Evaluate' />
</form>

</body></html>
`;

function doYourWorst(request, response) {
  console.log(request.url);

  const { query } = parse(request.url, true);
  console.log(query);

  if (query && query.code) {
    const code = query.code.trim();
    console.log('evaluating:', code);
    const s = SES.makeSESRootRealm({});

    try {
      const val = s.evaluate(code, {});
      response.end(`${val}`);
    } catch (err) {
      response.end(`failed: ${err}`);
    }

  } else {
    response.end(page);
  }
};


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
