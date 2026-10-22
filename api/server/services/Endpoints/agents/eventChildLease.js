const ariesApi = require('@aries/api');
const { GenerationJobManager } = ariesApi;
const {
  acquireSubagentThreadLease,
  renewSubagentThreadLease,
  releaseSubagentThreadLease,
} = require('~/models');

let acquireLease;

function acquireEventChildGenerationLease(input) {
  acquireLease ??= ariesApi.createEventChildGenerationLeaseAcquirer({
    methods: {
      acquireSubagentThreadLease,
      renewSubagentThreadLease,
      releaseSubagentThreadLease,
    },
    abortGeneration: (streamId, options) => GenerationJobManager.abortJob(streamId, options),
  });

  return acquireLease(input);
}

module.exports = { acquireEventChildGenerationLease };
