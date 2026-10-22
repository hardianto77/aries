const { createOpenIDRefreshFlightService } = require('@aries/api');
const { logger, encryptV2, decryptV2 } = require('@aries/data-schemas');
const db = require('~/models');

module.exports = createOpenIDRefreshFlightService({
  db,
  logger,
  encrypt: encryptV2,
  decrypt: decryptV2,
});
