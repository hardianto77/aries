const { createTwoFactorLimiters, limiterCache, removePorts } = require('@aries/api');
const { logViolation } = require('~/cache');

const { twoFactorTempLimiter, twoFactorSetupLimiter } = createTwoFactorLimiters({
  env: process.env,
  limiterCache,
  removePorts,
  logViolation,
});

module.exports = twoFactorTempLimiter;
module.exports.twoFactorSetupLimiter = twoFactorSetupLimiter;
