const mongoose = require('mongoose');
const { createSharedLinkAccessMiddleware } = require('@aries/api');

const canAccessSharedLink = createSharedLinkAccessMiddleware({ mongoose });

module.exports = canAccessSharedLink;
