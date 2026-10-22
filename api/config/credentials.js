require('dotenv').config();

const { bootstrapCredentials } = require('@aries/api/credentials');

module.exports = bootstrapCredentials();
