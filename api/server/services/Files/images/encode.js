const axios = require('axios');
const { encodeAndFormatImages } = require('@aries/api');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');

const dependencies = { getStrategyFunctions, httpClient: axios };

module.exports = {
  encodeAndFormat: (req, files, params, mode) =>
    encodeAndFormatImages(req, files, params, dependencies, mode),
};
