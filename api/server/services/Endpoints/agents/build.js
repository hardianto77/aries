const { logger } = require('@aries/data-schemas');
const { loadAgent: loadAgentFn } = require('@aries/api');
const { isAgentsEndpoint, removeNullishValues, Constants } = require('aries-data-provider');
const { getMCPServerTools } = require('~/server/services/Config');
const { getAccessibleMCPServers } = require('~/server/services/MCP');
const db = require('~/models');

const loadAgent = (params) =>
  loadAgentFn(params, {
    getAgent: db.getAgentWithVersionCount,
    getMCPServerTools,
    getAccessibleMCPServers,
  });

const buildOptions = (req, endpoint, parsedBody, endpointType) => {
  const { spec, iconURL, agent_id, chatProjectId, ...model_parameters } = parsedBody;
  const agentPromise = loadAgent({
    req,
    spec,
    agent_id: isAgentsEndpoint(endpoint) ? agent_id : Constants.EPHEMERAL_AGENT_ID,
    endpoint,
    model_parameters,
  }).catch((error) => {
    logger.error(`[/agents/:${agent_id}] Error retrieving agent during build options step`, error);
    return undefined;
  });

  /** @type {import('aries-data-provider').TConversation | undefined} */
  const addedConvo = req.body?.addedConvo;

  return removeNullishValues({
    spec,
    iconURL,
    endpoint,
    agent_id,
    endpointType,
    chatProjectId,
    model_parameters,
    agent: agentPromise,
    addedConvo,
  });
};

module.exports = { buildOptions };
