const {
  GenerationJobManager,
  createMessageRequestMiddleware,
  isPendingActionStale,
} = require('@aries/api');
const { logger } = require('@aries/data-schemas');
const { getConvoOwnership } = require('~/models');

module.exports = createMessageRequestMiddleware({
  getConvo: getConvoOwnership,
  getJob: (conversationId) => GenerationJobManager.getJob(conversationId),
  isPendingActionStale,
  logger,
});
