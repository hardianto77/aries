const { limiterCache, createMCPAppAdmissionRateLimiter } = require('@aries/api');
const { getMCPServersRegistry } = require('~/config');
const logViolation = require('~/cache/logViolation');

module.exports = createMCPAppAdmissionRateLimiter({
  store: limiterCache('mcp_app_admission_limiter'),
  getLimit: () => getMCPServersRegistry().getMCPAppsPolicy().maxAdmissionRequestsPerMinute,
  logViolation,
  score: process.env.TOOL_CALL_VIOLATION_SCORE,
});
