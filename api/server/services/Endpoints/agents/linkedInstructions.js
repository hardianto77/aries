const { logger } = require('@aries/data-schemas');
const { CacheKeys } = require('aries-data-provider');
const { createPromptService, createLinkedInstructionsResolver } = require('@aries/api');
const { grantPermission } = require('~/server/services/PermissionService');
const { getLogStores } = require('~/cache');
const db = require('~/models');

/**
 * Shared resolver for an agent's `instructionsPrompt` link. Resolve and cache
 * logic lives in `@aries/api` (`createLinkedInstructionsResolver`); this
 * module wires in the Aries prompt service and the
 * `AGENT_LINKED_INSTRUCTIONS` cache namespace (`~/cache/getLogStores.js`).
 */
const linkedInstructionsResolver = createLinkedInstructionsResolver({
  promptService: createPromptService({ db, grantPermission }),
  cache: getLogStores(CacheKeys.AGENT_LINKED_INSTRUCTIONS),
  logger,
});

/** @returns {import('@aries/api').ResolveLinkedInstructions} */
function getLinkedInstructionsResolver() {
  return linkedInstructionsResolver;
}

module.exports = { getLinkedInstructionsResolver };
