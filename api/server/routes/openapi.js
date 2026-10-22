const swaggerUiDist = require('swagger-ui-dist');
const { createOpenApiRouter } = require('@aries/api');
const { getAppConfig } = require('~/server/services/Config/app');

module.exports = createOpenApiRouter({
  getAppConfig,
  swaggerAssetsPath: swaggerUiDist.getAbsoluteFSPath(),
});
