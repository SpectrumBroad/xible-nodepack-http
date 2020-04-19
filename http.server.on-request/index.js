'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const serversIn = NODE.getInputByName('servers');

  const triggerOut = NODE.getOutputByName('trigger');
  const reqOut = NODE.getOutputByName('request');

  reqOut.on('trigger', async (conn, state) => {
    let req = null;
    const nodeState = state.get(NODE);

    if (nodeState && nodeState.req) {
      req = nodeState.req;
    }

    return req;
  });

  triggerIn.on('trigger', async (conn, state) => {
    let method = NODE.data.method || 'get';
    method = method.toLowerCase();

    const servers = await serversIn.getValues(state);
    servers.forEach((server) => {
      // setup a seperate state for each server
      const splitState = state.split();

      server[method](NODE.data.path || '/', (req) => {
        splitState.set(NODE, {
          req
        });

        triggerOut.trigger(splitState);
      });
    });
  });
};
