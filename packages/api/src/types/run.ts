import type { Providers, ClientOptions } from '@aries/agents';
import type { AgentModelParameters } from 'aries-data-provider';
import type { OpenAIConfiguration } from './openai';

export type RunLLMConfig = {
  provider: Providers;
  streaming: boolean;
  streamUsage: boolean;
  usage?: boolean;
  configuration?: OpenAIConfiguration;
} & AgentModelParameters &
  ClientOptions;
