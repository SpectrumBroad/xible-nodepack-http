'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const reqsIn = NODE.getInputByName('requests');
  const statusIn = NODE.getInputByName('status');
  const headersIn = NODE.getInputByName('headers');
  const bodyIn = NODE.getInputByName('body');

  const doneOut = NODE.getOutputByName('done');

  triggerIn.on('trigger', async (conn, state) => {
    const reqs = await reqsIn.getValues(state);
    if (!reqs.length) {
      NODE.error(new Error('No request provided to respond too'), state);
    }

    const [statuses, headers, bodies] = await Promise.all([
      statusIn.getValues(state),
      headersIn.getValues(state),
      bodyIn.getValues(state)
    ]);

    let status = NODE.data.status || 200;
    if (statuses.length) {
      status = statuses[0];
    }

    reqs.forEach((req) => {
      if (req && req.res) {
        // set the headers for this request
        headers.forEach((header) => {
          req.res.setHeader(header.name, header.value);
        });

        // set the status
        req.res.status(status);

        // send the result
        if (NODE.data.json === 'true') {
          if (NODE.data.isolate === 'true' && bodies.length === 1) {
            req.res.json(bodies[0]);
          } else {
            req.res.json(bodies);
          }
        } else {
          req.res.send(bodies.join(''));
        }
      }
    });

    doneOut.trigger(state);
  });
};
