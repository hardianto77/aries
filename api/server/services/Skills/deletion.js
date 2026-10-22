const {
  logger,
  runAsSystem,
  createSkillDeletionPersistenceAdapter,
} = require('@aries/data-schemas');
const { createSkillDeletionService } = require('@aries/api');
const db = require('~/models');
const { getAppConfig } = require('~/server/services/Config');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');

const service = createSkillDeletionService({
  persistence: { ...db, ...createSkillDeletionPersistenceAdapter(db) },
  loadConfig: () => getAppConfig({ baseOnly: true }),
  getStrategyFunctions,
  runAsSystem,
  logger,
});

module.exports = service;
