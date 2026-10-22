const cookie = require('cookie');
const { logger, runAsSystem } = require('@aries/data-schemas');
const {
  createOptionalShareFileAuth,
  clearCloudFrontCookies,
  isTwoFactorEnrollmentRequired,
  isTokenRetired,
  isEnabled,
} = require('@aries/api');
const { getUserById, findSession } = require('~/models');

module.exports = createOptionalShareFileAuth({
  parseCookie: cookie.parse,
  getUserById,
  findSession,
  runAsSystem,
  clearCloudFrontCookies,
  enrollmentRequired: isTwoFactorEnrollmentRequired,
  tokenRetired: isTokenRetired,
  enabled: isEnabled,
  warn: (...args) => logger.warn(...args),
});
