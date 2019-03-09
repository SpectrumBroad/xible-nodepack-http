'use strict';

module.exports = (NODE) => {
  const reqsIn = NODE.getInputByName('requests');

  const valuesOut = NODE.getOutputByName('values');
  valuesOut.on('trigger', async (conn, state) => {
    const requests = await reqsIn.getValues(state)
    const queries = requests
    .filter(req => req && req.query && req.query[NODE.data.paramName])
    .map(req => req.query[NODE.data.paramName]);

    return queries;
  });
};
