// Bootstrap public API surface.

export * from "./app/create-app.js";
export type {
  ListAiraSessionsOptions,
  PromptInput,
  ResolveLatestSessionOptions,
  ResumeOptions,
  RunAiraProtocolAgentOptions,
  SendInputOptions,
  SendInputResult,
  SetLocaleResult,
  SteerTurnOptions,
  SubmitPromptOptions,
  UserPromptInput,
  AiraApp,
  AiraAppOptions,
  AiraModelOption,
} from "./app/types.js";
export * from "./auth-login.js";
export {
  inspectAiraCustomCommand,
  listAiraCustomCommands,
  loadAiraCustomCommand,
} from "./custom-commands.js";
export type {
  InspectAiraCustomCommandOptions,
  ListAiraCustomCommandsOptions,
  AiraCustomCommandInspection,
} from "./custom-commands.js";
export { createModelAdapter } from "./model-factory.js";
export type { CreateModelAdapterOptions } from "./model-factory.js";
export { startProcessProviderRegistryRuntime } from "./app/process-provider-registry-runtime.js";
export type { ProcessProviderRegistryRuntimeOptions } from "./app/process-provider-registry-runtime.js";
export {
  addAiraPluginMarketplace,
  getAiraPluginsOverview,
  installAiraMarketplacePlugin,
  listAiraPlugins,
  removeAiraPluginMarketplace,
  resolveAiraPlugins,
  setAiraPluginEnabled,
  uninstallAiraMarketplacePlugin,
  updateAiraMarketplacePlugin,
  updateAiraPluginMarketplace,
  validateAiraPluginPath,
} from "./plugins.js";
export type {
  AddAiraMarketplaceOptions,
  InstallAiraMarketplacePluginOptions,
  ListAiraPluginsOptions,
  RemoveAiraMarketplaceOptions,
  ResolveAiraPluginsOptions,
  SetAiraPluginEnabledOptions,
  SetAiraPluginEnabledResult,
  UninstallAiraMarketplacePluginOptions,
  UpdateAiraMarketplaceOptions,
  UpdateAiraMarketplacePluginOptions,
  ValidateAiraPluginPathOptions,
  AiraAvailablePluginData,
  AiraInstalledPluginData,
  AiraMarketplaceSummaryData,
  AiraMarketplaceUpdateData,
  AiraPluginInstallData,
  AiraPluginUpdateData,
  AiraPluginsOverviewData,
} from "./plugins.js";
export { runAiraProtocolAgent } from "./aira-protocol-entrypoint.js";
// Exposed for the CLI's --output-format stream-json: it needs the same event
// shape the protocol server emits, rather than inventing a second one.
export { mapSessionEvent } from "./aira-protocol/session-mapper.js";
export { prepareAiraTelemetryEnv, shutdownAiraTelemetry } from "./telemetry-bootstrap.js";
export type { SessionTranscriptMessage, SessionTranscriptPart } from "./session-transcript.js";
export { listAiraSessions, resolveLatestSession } from "./sessions.js";
export { inspectAiraSkill, listAiraSkills } from "./skills.js";
export type {
  InspectAiraSkillOptions,
  ListAiraSkillsOptions,
  AiraSkillInspection,
} from "./skills.js";
// Exposed for the CLI's headless slash routing: it must decide "is this a real
// custom command?" with the *same* reserved-name gate the app facade's
// customCommandPromptResolver applies, or the two disagree and a reserved name
// reaches the model as literal prompt text. See prompt-command.ts.
export { isReservedAiraSlashCommandName } from "./slash-command-surface.js";
export {
  grantWorkspaceHookTrust,
  inspectWorkspaceHookTrust,
  revokeWorkspaceHookTrustCli,
} from "./workspace-hook-trust-cli.js";
export type {
  WorkspaceHookTrustCliItem,
  WorkspaceHookTrustCliStatus,
  WorkspaceHookTrustCliTarget,
} from "./workspace-hook-trust-cli.js";
