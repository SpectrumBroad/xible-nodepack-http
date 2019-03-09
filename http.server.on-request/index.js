'use strict';

module.exports = (NODE) => {
  const serverIn = NODE.getInputByName('server');

  const triggerOut = NODE.getOutputByName('trigger');
  const reqOut = NODE.getOutputByName('request');

  reqOut.on('trigger', (conn, state, callback) => {
    let req = null;
    const nodeState = state.get(NODE);

    if (nodeState && nodeState.req) {
      req = nodeState.req;
    }

    callback(req);
  });

  NODE.on('init', (state) => {
    let method = NODE.data.method || 'get';
    method = method.toLowerCase();

    serverIn.getValues(state)
    .then((servers) => {
      servers.forEach((server) => {
        // setup a seperate state for each server
        const splitState = state.split();

        server[method](NODE.data.path || '/', (req, res) => {
          splitState.set(NODE, {
            req
          });

          triggerOut.trigger(splitState);
        });
      });
    });
  });
};
