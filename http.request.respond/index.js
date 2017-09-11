'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const reqsIn = NODE.getInputByName('requests');
  const resIn = NODE.getInputByName('response');

  const doneOut = NODE.getOutputByName('done');

  triggerIn.on('trigger', (conn, state) => {
    reqsIn.getValues(state)
    .then((reqs) => {
      if (!reqs.length) {
        return;
      }

      resIn.getValues(state)
      .then((ress) => {
        reqs.forEach((req) => {
          if (req && req.res) {
            req.res.status(NODE.data.status || 200).send(ress.join(''));
          }
        });
        doneOut.trigger(state);
      });
    });
  });
};
