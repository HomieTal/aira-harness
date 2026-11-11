import { z } from "zod";
import type { CommandAgentSource } from "./command-types.js";
import type { AiraProvider } from "./aira-task-types-core.js";

export const AIRA_AGENT_PROVIDER = "glm" satisfies AiraProvider;
export const AIRA_AGENT_PROVIDER_LABEL = "Aira Agent";
export const AIRA_COMMAND_AGENT_SOURCE = "airaAgent" satisfies CommandAgentSource;

export const airaAgentProviderSchema = z.literal(AIRA_AGENT_PROVIDER);

export const AIRA_COMMAND_AGENT_SOURCES = [
  AIRA_COMMAND_AGENT_SOURCE,
] as const satisfies readonly CommandAgentSource[];

export function normalizeAgentProviderToAiraAgent(
  _provider?: AiraProvider | null,
): AiraProvider {
  return AIRA_AGENT_PROVIDER;
}

export function isAiraAgentProvider(
  provider: AiraProvider | null | undefined,
): provider is typeof AIRA_AGENT_PROVIDER {
  return provider === AIRA_AGENT_PROVIDER;
}
