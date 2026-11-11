import type {
  AiraAgentMcpServer,
  AiraAutomationScheduleRule,
  AiraMcpListMode,
  ModelSelection,
} from "@aira/shared";

export interface AiraAgentWorkspaceTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  /** 远程 workspace 的运行时会话身份；只用于隔离/路由，不能替代 workspacePath。 */
  remoteSessionId?: string;
}

export interface AiraAgentPluginViewParams extends AiraAgentWorkspaceTarget {
  configScope?: "user" | "workspace";
}

export interface AiraAgentListMcpServerStatusesParams extends AiraAgentWorkspaceTarget {
  mcpServers?: AiraAgentMcpServer[];
  mode?: AiraMcpListMode;
}

export interface AiraAgentAddPluginMarketplaceParams extends AiraAgentWorkspaceTarget {
  dryRun?: boolean;
  operationId?: string;
  source: string;
}

export interface AiraAgentRemovePluginMarketplaceParams extends AiraAgentWorkspaceTarget {
  marketplace: string;
}

export interface AiraAgentUpdatePluginMarketplaceParams extends AiraAgentWorkspaceTarget {
  marketplace?: string;
  operationId?: string;
}

export interface AiraAgentInstallPluginParams extends AiraAgentWorkspaceTarget {
  dryRun?: boolean;
  marketplace: string;
  operationId?: string;
  pluginName: string;
  scope?: "user" | "workspace";
}

export interface AiraAgentCancelPluginOperationParams {
  operationId: string;
}

export interface AiraAgentUninstallPluginParams extends AiraAgentWorkspaceTarget {
  marketplace?: string;
  pluginId?: string;
  pluginName?: string;
  removeCache?: boolean;
}

export interface AiraAgentUpdatePluginParams extends AiraAgentWorkspaceTarget {
  pluginId?: string;
  marketplace?: string;
}

export interface AiraAgentRestoreBuiltinPluginParams extends AiraAgentWorkspaceTarget {
  pluginId: string;
}

export interface AiraAgentConfigurePluginParams extends AiraAgentWorkspaceTarget {
  clearOptionKeys?: string[];
  dryRun?: boolean;
  options: Record<string, unknown>;
  pluginId: string;
  scope?: "user" | "workspace";
}

export interface AiraAgentResetPluginConfigParams extends AiraAgentWorkspaceTarget {
  pluginId: string;
  scope?: "user" | "workspace";
}

export interface AiraAgentValidatePluginParams extends AiraAgentWorkspaceTarget {
  marketplace?: string;
  pluginName?: string;
  source?: string;
}

export interface AiraAgentDescribePluginParams extends AiraAgentWorkspaceTarget {
  marketplace: string;
  pluginName: string;
}

export interface AiraAgentSetPluginEnabledParams extends AiraAgentWorkspaceTarget {
  enabled: boolean;
  operationId?: string;
  pluginId: string;
  scope?: "user" | "workspace";
}

// Plugin 对话引用 catalog：
// 带 sessionId → session-owned 冻结 catalog（必须路由到持有该 session 的 workspace client）；
// 不带 → workspace 当前 catalog（新建草稿 Picker）。
export interface AiraAgentPluginReferenceCatalogParams extends AiraAgentWorkspaceTarget {
  sessionId?: string;
}

// Composer Skill catalog：与 Plugin 引用相同，以 sessionId 区分 workspace 当前目录和
// resident Session runtime 快照；不参与 Settings 管理目录。
export interface AiraAgentSkillReferenceCatalogParams extends AiraAgentWorkspaceTarget {
  sessionId?: string;
}
export interface AiraAgentResolveSuggestedPluginReferenceParams extends AiraAgentWorkspaceTarget {
  stableId: string;
  operationId: string;
  clientMode: "desktop-continuous" | "web-remote-replayable";
  deliveryKind: "desktop-continuous" | "web-remote-replayable";
}

// ---- 定时任务(automation)管理参数 ----

export interface AiraAgentCreateAutomationParams extends AiraAgentWorkspaceTarget {
  title: string;
  cronExpr: string;
  relativeDelayMinutes?: number;
  prompt: string;
  modelSelection?: ModelSelection;
  mode?: string;
  recurring?: boolean;
  maxRuns?: number;
  endAt?: number;
  scheduleRule?: AiraAutomationScheduleRule;
}

export interface AiraAgentUpdateAutomationParams extends AiraAgentWorkspaceTarget {
  automationId: string;
  title?: string;
  cronExpr?: string;
  prompt?: string;
  modelSelection?: ModelSelection | null;
  mode?: string | null;
  recurring?: boolean;
  maxRuns?: number | null;
  endAt?: number | null;
  scheduleRule?: AiraAutomationScheduleRule | null;
  scheduleEditedByUser?: boolean;
}

export interface AiraAgentAutomationIdParams extends AiraAgentWorkspaceTarget {
  automationId: string;
}

export interface AiraAgentSetAutomationEnabledParams extends AiraAgentWorkspaceTarget {
  automationId: string;
  enabled: boolean;
}

export interface AiraAgentDeleteAutomationRunParams extends AiraAgentWorkspaceTarget {
  runId: string;
}
