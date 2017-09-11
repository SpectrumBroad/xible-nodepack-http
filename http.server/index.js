'use strict';

module.exports = (NODE) => {
  let expressApp;

  const serverOut = NODE.getOutputByName('server');
  serverOut.on('trigger', (conn, state, callback) => {
    if (!expressApp) {
      NODE.once('init', () => callback(expressApp));
      return;
    }

    callback(expressApp);
  });

  NODE.on('init', (state) => {
    const express = require('express');
    const bodyParser = require('body-parser');
    const http = require('http');

    expressApp = express();
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
      expressApp
      .listen(NODE.data.port, () => {
        NODE.addStatus({
          message: 'running',
          color: 'green'
        });
      });
    } catch (err) {
      NODE.error(err, state);
    }
  });
};
