const { createBlockRetiredSetupToken } = require('@aries/api');
const { getUserById } = require('~/models');

module.exports = createBlockRetiredSetupToken({ getUserById });
