const { generateCapabilityCheck, capabilityContextMiddleware } = require('@aries/api');
const {
  getUserPrincipals,
  hasAnyConfigReadAccess,
  hasCapabilityForPrincipals,
  getHeldCapabilities: getHeldCapabilitiesForPrincipals,
} = require('~/models');

const {
  hasCapability,
  requireCapability,
  hasConfigCapability,
  getHeldCapabilities,
  hasAnyConfigReadAccess: checkAnyConfigReadAccess,
  getReadableConfigSections,
} = generateCapabilityCheck({
  getUserPrincipals,
  hasAnyConfigReadAccess,
  hasCapabilityForPrincipals,
  getHeldCapabilities: getHeldCapabilitiesForPrincipals,
});

module.exports = {
  hasCapability,
  requireCapability,
  hasConfigCapability,
  getHeldCapabilities,
  capabilityContextMiddleware,
  hasAnyConfigReadAccess: checkAnyConfigReadAccess,
  getReadableConfigSections,
};
