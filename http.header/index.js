'use strict';

module.exports = (NODE) => {
  const headerOut = NODE.getOutputByName('header');
  headerOut.on('trigger', async () =>
    ({
      name: NODE.data.headerName,
      value: NODE.data.headerValue
    })
  );
};
