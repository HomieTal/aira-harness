import { z } from "zod";
import type { CommandAgentSource } from "./command-types.js";
import type { AiraProvider } from "./aira-task-types-core.js";

export const AIRA_AGENT_PROVIDER = "glm" satisfies AiraProvider;
export const AIRA_AGENT_PROVIDER_LABEL = "Aira Agent";
export const AIRA_COMMAND_AGENT_SOURCE = "airaAgent" satisfies CommandAgentSource;

/**
 * 解析持久化/relay 数据时的 provider 归一 schema：
 * 已移除的第三方 provider 历史值仅作为归一化输入保留，统一收敛为 glm；
 * 其它非法值保持拒绝，与收窄前的校验边界一致。
 */
export const legacyAiraProviderSchema = z
  .enum(["claude", "opencode", "gemini", "codex", "glm"])
  .transform((): typeof AIRA_AGENT_PROVIDER => AIRA_AGENT_PROVIDER);

export const AIRA_ENABLED_AGENT_PROVIDERS = [
  AIRA_AGENT_PROVIDER,
] as const satisfies readonly AiraProvider[];

export const AIRA_COMMAND_AGENT_SOURCES = [
  AIRA_COMMAND_AGENT_SOURCE,
] as const satisfies readonly CommandAgentSource[];

export function normalizeAgentProviderToAiraAgent(
  _provider?: AiraProvider | null,
): AiraProvider {
  return AIRA_AGENT_PROVIDER;
}

export function normalizeAgentProvidersToAiraAgent(
  _providers?: ReadonlyArray<AiraProvider> | null,
): AiraProvider[] {
  return [...AIRA_ENABLED_AGENT_PROVIDERS];
}

export function normalizeCommandAgentSourceToAiraAgent(
  _agentSource?: CommandAgentSource | null,
): CommandAgentSource {
  return AIRA_COMMAND_AGENT_SOURCE;
}

export function isAiraAgentProvider(
  provider: AiraProvider | null | undefined,
): provider is typeof AIRA_AGENT_PROVIDER {
  return provider === AIRA_AGENT_PROVIDER;
}
