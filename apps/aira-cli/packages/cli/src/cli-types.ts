import type { TuiReadClipboardImage, TuiWriteClipboardText } from "@aira/tui";
import type { UiLocale } from "@aira/i18n";
import type { Logger } from "@aira/contracts";
import type {
  createManagedCdpBrowserRuntime,
  ManagedCdpBrowserRuntimeOptions,
} from "@aira/adapters/browser";
import type {
  createModelAdapter,
  createAiraApp,
  CreateModelAdapterOptions,
  configureCodingPlanApiKey,
  ConfigureCodingPlanApiKeyOptions,
  inspectAiraSkill,
  inspectWorkspaceHookTrust,
  grantWorkspaceHookTrust,
  revokeWorkspaceHookTrustCli,
  inspectAiraCustomCommand,
  InspectAiraCustomCommandOptions,
  InspectAiraSkillOptions,
  loginAiraCli,
  loginBigmodelCodingPlan,
  LoginBigmodelCodingPlanOptions,
  LoginAiraCliOptions,
  listAiraCustomCommands,
  ListAiraCustomCommandsOptions,
  loadAiraCustomCommand,
  listAiraSessions,
  listAiraSkills,
  ListAiraSessionsOptions,
  ListAiraSkillsOptions,
  logoutAiraCli,
  LogoutAiraCliOptions,
  resolveLatestSession,
  ResolveLatestSessionOptions,
  RunAiraProtocolAgentOptions,
  prepareAiraTelemetryEnv,
  startProcessProviderRegistryRuntime,
  shutdownAiraTelemetry,
  AiraAppOptions,
} from "@aira/bootstrap";
import type { CliEnv, DotenvLoadResult, LoadCliDotenvOptions } from "./env.js";
import type { PluginsCommandOverrides } from "./plugins-command.js";
import type { CliShutdownProcess } from "./shutdown.js";
import type { resolveWorkspaceGitBranch } from "./tui-workspace-git.js";

export type BootstrapModule = typeof import("@aira/bootstrap");

export interface RunDependencies extends PluginsCommandOverrides {
  protocolLifecycle?: RunAiraProtocolAgentOptions["lifecycle"];
  protocolInput?: NodeJS.ReadableStream;
  createManagedCdpBrowserRuntime?: (
    options?: ManagedCdpBrowserRuntimeOptions,
  ) => ReturnType<typeof createManagedCdpBrowserRuntime>;
  createModelAdapter?: (
    options?: CreateModelAdapterOptions,
  ) => ReturnType<typeof createModelAdapter>;
  createAiraApp?: (
    options?: AiraAppOptions,
  ) => Awaited<ReturnType<typeof createAiraApp>> | ReturnType<typeof createAiraApp>;
  /**
   * Session-event shaper for --output-format stream-json. Defaults to the
   * bootstrap module's, which is also what the protocol server uses; injectable
   * so a caller that supplies its own `createAiraApp` (tests, embedders) can
   * still stream, since the bootstrap module is not loaded on that path.
   */
  mapSessionEvent?: BootstrapModule["mapSessionEvent"];
  cwd?: () => string;
  env?: CliEnv;
  inspectSkill?: (options: InspectAiraSkillOptions) => ReturnType<typeof inspectAiraSkill>;
  inspectWorkspaceHookTrust?: typeof inspectWorkspaceHookTrust;
  grantWorkspaceHookTrust?: typeof grantWorkspaceHookTrust;
  revokeWorkspaceHookTrustCli?: typeof revokeWorkspaceHookTrustCli;
  inspectCustomCommand?: (
    options: InspectAiraCustomCommandOptions,
  ) => ReturnType<typeof inspectAiraCustomCommand>;
  loginAiraCli?: (options?: LoginAiraCliOptions) => ReturnType<typeof loginAiraCli>;
  loginBigmodelCodingPlan?: (
    options?: LoginBigmodelCodingPlanOptions,
  ) => ReturnType<typeof loginBigmodelCodingPlan>;
  configureCodingPlanApiKey?: (
    options: ConfigureCodingPlanApiKeyOptions,
  ) => ReturnType<typeof configureCodingPlanApiKey>;
  loadDotenv?: (options?: LoadCliDotenvOptions) => DotenvLoadResult;
  prepareAiraTelemetryEnv?: typeof prepareAiraTelemetryEnv;
  projectConfigPath?: string;
  listSessions?: (options: ListAiraSessionsOptions) => ReturnType<typeof listAiraSessions>;
  listCustomCommands?: (
    options: ListAiraCustomCommandsOptions,
  ) => ReturnType<typeof listAiraCustomCommands>;
  loadCustomCommand?: (
    options: InspectAiraCustomCommandOptions,
  ) => ReturnType<typeof loadAiraCustomCommand>;
  // headless slash 路由要和 app facade 的保留名 gate 用同一个判据；默认取 bootstrap 的，
  // 注入点只为让单测不必拉起整个 bootstrap 模块。见 prompt-command.ts。
  isReservedSlashCommandName?: BootstrapModule["isReservedAiraSlashCommandName"];
  listSkills?: (options: ListAiraSkillsOptions) => ReturnType<typeof listAiraSkills>;
  logger?: Logger;
  readClipboardImage?: TuiReadClipboardImage;
  writeClipboardText?: TuiWriteClipboardText;
  resolveLatestSession?: (
    options: ResolveLatestSessionOptions,
  ) => ReturnType<typeof resolveLatestSession>;
  resolveWorkspaceGitBranch?: typeof resolveWorkspaceGitBranch;
  logoutAiraCli?: (options?: LogoutAiraCliOptions) => ReturnType<typeof logoutAiraCli>;
  runAiraProtocolAgent?: (options?: RunAiraProtocolAgentOptions) => Promise<void>;
  runTui?: typeof import("@aira/tui").runTui;
  skipUserConfig?: boolean;
  userConfigPath?: string;
  exitProcess?: (code: number) => void;
  shutdownCleanupTimeoutMs?: number;
  shutdownProcess?: CliShutdownProcess;
  startProcessProviderRegistryRuntime?: typeof startProcessProviderRegistryRuntime;
  shutdownAiraTelemetry?: typeof shutdownAiraTelemetry;
}

export type CliPermissionMode = "build" | "plan" | "edit" | "yolo";
export type CliRuntimeMode = CliPermissionMode | "auto";

export interface CliModeState {
  current?: CliRuntimeMode;
  override?: CliPermissionMode;
}

export interface CliTargetRequest {
  objective: string;
  replaceExisting: boolean;
}

export type ModeCapableApp = Awaited<ReturnType<typeof createAiraApp>> & {
  getMode?: () => CliRuntimeMode;
  setLocale?: (locale: UiLocale) => Promise<{ locale: "en-US" | "zh-CN" }>;
  setMode?: (mode: CliRuntimeMode) => Promise<{ mode: CliRuntimeMode }>;
};

export interface CliResumeRequest {
  continueSession: boolean;
  resumeSessionId?: string;
}
