'use strict';

module.exports = (NODE) => {
  const reqsIn = NODE.getInputByName('requests');

  const headersOut = NODE.getOutputByName('headers');
  headersOut.on('trigger', async (conn, state) => {
    const requests = await reqsIn.getValues(state);
    const headers = requests
    .map(req => ({
      name: NODE.data.headerName,
      value: req.get(NODE.data.headerName)
    }));

    return headers;
  });

  const valuesOut = NODE.getOutputByName('values');
  valuesOut.on('trigger', async (conn, state) => {
    const requests = await reqsIn.getValues(state);
    const headers = requests
    .map(req => req.get(NODE.data.headerName));

    return headers;
  });
};
