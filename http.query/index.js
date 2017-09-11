'use strict';

module.exports = (NODE) => {
  const reqsIn = NODE.getInputByName('requests');

  const valueOut = NODE.getOutputByName('value');
  valueOut.on('trigger', (conn, state, callback) => {
    reqsIn.getValues(state)
    .then((requests) => {
      const queries = requests
      .filter(req => req && req.query && req.query[NODE.data.paramName])
      .map(req => req.query[NODE.data.paramName]);

      callback(queries);
    });
  });
};
