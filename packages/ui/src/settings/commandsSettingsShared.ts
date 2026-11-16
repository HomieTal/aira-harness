import {
  AIRA_AGENT_PROVIDER,
  AIRA_COMMAND_AGENT_SOURCES,
  type AiraProvider,
  type CommandAgentSource,
} from "@aira/shared";

export const COMMAND_AGENT_SOURCES = [
  ...AIRA_COMMAND_AGENT_SOURCES,
] as const satisfies readonly CommandAgentSource[];

export const COMMAND_AGENT_SOURCE_META: Record<
  CommandAgentSource,
  {
    labelId: string;
    provider: AiraProvider;
    pathHint: string;
  }
> = {
  airaAgent: {
    labelId: "settings.commands.source.airaAgent",
    pathHint: "~/.aira/commands",
    provider: AIRA_AGENT_PROVIDER,
  },
};
