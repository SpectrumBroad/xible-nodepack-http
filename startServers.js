'use strict';

async function startServers(NODE, state, secure) {
  const express = require('express');
  const bodyParser = require('body-parser');

  let spdy;
  let fs;
  if (secure) {
    spdy = require('spdy');
    fs = require('fs');
  }

  const portsIn = NODE.getInputByName('ports');
  const ports = await portsIn.getValues(state);
  if (!ports.length) {
    ports.push(NODE.data.port);
  }

  const startedOut = NODE.getOutputByName('started');

  const servers = await Promise.all(ports.map((port) => {
    return new Promise((resolve, reject) => {
      const expressApp = express();
      expressApp.use(bodyParser.json());

      // setup default express stuff
      expressApp.use((req, res, next) => {
        res.removeHeader('X-Powered-By');

        // disable caching
        res.header('cache-control', 'private, no-cache, no-store, must-revalidate');
        res.header('expires', '-1');
        res.header('pragma', 'no-cache');

        // access control
        res.header('access-control-allow-origin', '*');
        res.header('access-control-allow-headers', 'x-access-token, content-type');
        res.header('access-control-allow-methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS,HEAD');

        NODE.addStatus({
          message: `${req.method} ${req.originalUrl}`,
          timeout: 1000
        });

        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }

        // local vars for requests
        req.locals = {};

        next();
      });

      try {
        const listenCallback = () => {
          NODE.addStatus({
            message: 'running',
            color: 'green'
          });
          resolve(expressApp);
        };

        if (secure) {
          spdy.createServer({
            key: fs.readFileSync(NODE.data.keyPath),
            cert: fs.readFileSync(NODE.data.certPath)
          }, expressApp)
          .listen(port, listenCallback);
        } else {
          expressApp
          .listen(port, listenCallback);
        }
      } catch (err) {
        NODE.error(err, state);
        reject(err);
      }
    });
  }));

  state.set(NODE, {
    servers
  });

  startedOut.trigger(state);
  return servers;
}

module.exports = startServers;
