import { resolve } from "node:path";
import { createConfigWithPluginMigrations } from "@aira/adapters/config";
import { createNodeCustomCommandAdapter } from "@aira/adapters/commands";
import type {
  CustomCommandContent,
  CustomCommandDiagnostic,
  CustomCommandLoadOutcome,
  Logger,
} from "@aira/contracts";
import { resolveAiraPlugins, type ResolveAiraPluginsOptions } from "./plugins.js";
import { collectDisabledPaths } from "./skill-command-overrides.js";

export interface ListAiraCustomCommandsOptions {
  workspaceIdentity?: string;
  remoteSessionId?: string;
  pluginPreparation?: ResolveAiraPluginsOptions["pluginPreparation"];
  pluginDiscovery?: ResolveAiraPluginsOptions["pluginDiscovery"];
  env?: NodeJS.ProcessEnv;
  homeDirectory?: string;
  logger?: Logger;
  projectConfigPath?: string;
  skipUserConfig?: boolean;
  userConfigPath?: string;
  workingDirectory?: string;
  additionalDirectories?: readonly string[];
}

export interface InspectAiraCustomCommandOptions extends ListAiraCustomCommandsOptions {
  name: string;
}

export interface AiraCustomCommandInspection {
  command: CustomCommandContent;
  diagnostics: CustomCommandDiagnostic[];
}

export async function listAiraCustomCommands(
  options: ListAiraCustomCommandsOptions = {},
): Promise<CustomCommandLoadOutcome> {
  const discovery = await createCustomCommandDiscovery(options);
  return await discovery.adapter.discoverCommands({
    workingDirectory: discovery.workingDirectory,
  });
}

export async function inspectAiraCustomCommand(
  options: InspectAiraCustomCommandOptions,
): Promise<AiraCustomCommandInspection> {
  const discovery = await createCustomCommandDiscovery(options);
  const workingDirectory = discovery.workingDirectory;
  const adapter = discovery.adapter;
  const outcome = await adapter.discoverCommands({ workingDirectory });
  const normalizedName = normalizeCommandName(options.name);
  if (!outcome.commands.some((command) => command.name === normalizedName)) {
    throw new Error(`Custom command not found: ${options.name}`);
  }

  return {
    command: await adapter.loadCommand({
      name: normalizedName,
      workingDirectory,
    }),
    diagnostics: outcome.diagnostics,
  };
}

export async function loadAiraCustomCommand(
  options: InspectAiraCustomCommandOptions,
): Promise<CustomCommandContent> {
  const discovery = await createCustomCommandDiscovery(options);
  return await discovery.adapter.loadCommand({
    name: normalizeCommandName(options.name),
    workingDirectory: discovery.workingDirectory,
  });
}

async function createCustomCommandDiscovery(options: ListAiraCustomCommandsOptions) {
  const workingDirectory = resolve(options.workingDirectory ?? process.cwd());
  const configResult = await createConfigWithPluginMigrations({
    env: options.env,
    projectConfigPath: options.projectConfigPath,
    workingDirectory,
    skipUserConfig: options.skipUserConfig,
    userConfigPath: options.userConfigPath,
  });
  const pluginOutcome = await resolveAiraPlugins({
    pluginPreparation: options.pluginPreparation,
    pluginDiscovery: options.pluginDiscovery,
    workspaceIdentity: options.workspaceIdentity,
    remoteSessionId: options.remoteSessionId,
    configResult,
    env: options.env,
    logger: options.logger,
    projectConfigPath: options.projectConfigPath,
    skipUserConfig: options.skipUserConfig,
    userConfigPath: options.userConfigPath,
    workingDirectory,
  });
  return {
    adapter: createNodeCustomCommandAdapter({
      extraResolvedRoots: pluginOutcome.commandRoots,
      disabledPaths: collectDisabledPaths(configResult.config.commandOverrides),
      homeDirectory: options.homeDirectory,
      additionalDirectories: options.additionalDirectories,
    }),
    workingDirectory,
  };
}

function normalizeCommandName(name: string): string {
  return name.trim().replace(/^\/+/, "").toLowerCase();
}
