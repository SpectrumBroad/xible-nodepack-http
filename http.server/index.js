'use strict';

const startServers = require('../startServers.js');

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  triggerIn.on('trigger', async (conn, state) => {
    startServers(NODE, state);
  });

  const serversOut = NODE.getOutputByName('servers');
  serversOut.on('trigger', async (conn, state) => {
    const thisState = state.get(NODE);
    return thisState ? state.get(NODE).servers : undefined;
  });

  NODE.on('init', async (state) => {
    if (!triggerIn.isConnected()) {
      startServers(NODE, state);
    }
  });
};
