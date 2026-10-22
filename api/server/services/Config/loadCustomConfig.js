const path = require('path');
const { loadYaml, redactConfigSecretMaps, createCustomConfigLoader } = require('@aries/api');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const defaultConfigPath = path.resolve(projectRoot, 'aries.yaml');

module.exports = createCustomConfigLoader({
  loadLocal: loadYaml,
  defaultConfigPath,
  redactConfig: redactConfigSecretMaps,
});
