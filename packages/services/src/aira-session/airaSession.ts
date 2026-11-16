import { ServiceChannels } from "@aira/shared";
import type {
  TraceId,
  AiraAgentMcpServer,
  AiraDeliveryKind,
  AiraMessageWithParts,
  ModelSelection,
  AiraPermissionRequestParams,
  AiraProviderRuntimeHeadersRequestParams,
  AiraUserInputRequestParams,
  AiraUserInputResponse,
  AiraSessionInfo,
  AiraSessionImportHistory,
  AiraSessionEvent,
  AiraSessionMode,
  AiraSessionPersistence,
  AiraSessionStateSnapshot,
  AiraStateUpdatedNotification,
  AiraWorkspacePresentation,
} from "@aira/shared";
import { createServiceDescriptor } from "#src/descriptors.js";
import type { ProviderRuntimeHeadersUiResponse } from "#src/aira-agent/airaAgent.js";

export interface AiraSessionWorkspaceTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

export type AiraSessionReadWorkspacePresentationParams = AiraSessionWorkspaceTarget;

export interface AiraTaskTarget extends AiraSessionWorkspaceTarget {
  sessionId: string;
}

export interface AiraSessionCreateParams extends AiraSessionWorkspaceTarget {
  /** 仅导入事务使用的预分配 ID；普通新会话继续由 Agent 分配。 */
  sessionId?: string;
  sessionTraceId?: TraceId;
  parentSessionId?: string;
  mode?: AiraSessionMode;
  model?: ModelSelection;
  persistence?: AiraSessionPersistence;
  thoughtLevel?: string;
  mcpServers?: AiraAgentMcpServer[];
  importedHistory?: AiraSessionImportHistory;
}

export interface AiraSessionResumeParams extends AiraTaskTarget {
  model?: ModelSelection;
  thoughtLevel?: string;
  mcpServers?: AiraAgentMcpServer[];
  /**
   * 默认广播 resume 得到的历史快照，并让 shadow 订阅请求初始 snapshot。
   * 续聊发送前的 runtime 预恢复会关闭它，避免旧终态快照覆盖本地已开始的新输入运行态。
   */
  broadcastSnapshot?: boolean;
}

export interface AiraSessionListParams extends AiraSessionWorkspaceTarget {
  limit?: number;
}

export interface AiraSessionReadParams extends AiraTaskTarget {
  deliveryKind?: AiraDeliveryKind;
  messageLimit?: number;
  afterSeq?: number;
}

export interface AiraSessionMessagesParams extends AiraTaskTarget {
  afterMessageId?: string;
  limit?: number;
}

export interface AiraSessionEventsParams extends AiraTaskTarget {
  afterSeq?: number;
  limit?: number;
}

export interface AiraSessionSetModelParams extends AiraTaskTarget {
  model: ModelSelection;
  expectedRevision?: number;
  persistAsWorkspaceLastUsed?: boolean;
}

export interface AiraSessionSetThoughtLevelParams extends AiraTaskTarget {
  thoughtLevel?: string;
  expectedRevision?: number;
  persistAsWorkspaceLastUsed?: boolean;
}

export interface AiraSessionSetModeParams extends AiraTaskTarget {
  mode: AiraSessionMode;
  expectedRevision?: number;
}

export interface AiraSessionRespondProviderRuntimeHeadersParams extends AiraTaskTarget {
  requestId: string;
  response: ProviderRuntimeHeadersUiResponse;
}

export interface AiraSessionSubscribeParams extends AiraTaskTarget {
  deliveryKind: AiraDeliveryKind;
  afterSeq?: number;
  includeSnapshot?: boolean;
  eventCoalescing?: {
    mode: "background-summary";
    intervalMs?: number;
  };
}

export type AiraSessionServiceEvent =
  | { type: "session.event"; event: AiraSessionEvent }
  | { type: "state.updated"; notification: AiraStateUpdatedNotification }
  | { type: "permission.request"; request: AiraPermissionRequestParams }
  | { type: "userInput.request"; request: AiraUserInputRequestParams }
  | {
      type: "userInput.response";
      requestId: string;
      response: AiraUserInputResponse;
    }
  | { type: "providerRuntimeHeaders.request"; request: AiraProviderRuntimeHeadersRequestParams }
  | { type: "snapshot"; snapshot: AiraSessionStateSnapshot };

export interface AiraSessionInitializeResult {
  available: boolean;
  workspaceKey: string;
  protocolName?: string;
  protocolVersion?: number;
  transportKind?: "stdio" | "websocket";
  reason?: string;
  reasonCode?: "provider_not_ready";
}

export interface AiraSessionWorkspaceRuntimeIdentity {
  generation: number;
  identity: string;
  processId?: number;
  workspaceKey: string;
}

export interface IAiraSessionService {
  initializeWorkspace(params: AiraSessionWorkspaceTarget): Promise<AiraSessionInitializeResult>;
  getWorkspaceRuntimeIdentity(
    params: AiraSessionWorkspaceTarget,
  ): Promise<AiraSessionWorkspaceRuntimeIdentity>;
  readWorkspacePresentation(
    params: AiraSessionReadWorkspacePresentationParams,
  ): Promise<AiraWorkspacePresentation>;
  createSession(params: AiraSessionCreateParams): Promise<AiraSessionStateSnapshot>;
  resumeSession(params: AiraSessionResumeParams): Promise<AiraSessionStateSnapshot>;
  listSessions(params: AiraSessionListParams): Promise<AiraSessionInfo[]>;
  readSession(params: AiraSessionReadParams): Promise<AiraSessionStateSnapshot>;
  readSessionMessages(params: AiraSessionMessagesParams): Promise<AiraMessageWithParts[]>;
  readSessionEvents(params: AiraSessionEventsParams): Promise<AiraSessionEvent[]>;
  promoteDeferredDraftSession(params: AiraTaskTarget): Promise<void>;
  closeSession(params: AiraTaskTarget): Promise<void>;
  closeDeferredDraftSession(params: AiraTaskTarget): Promise<boolean>;
  setModel(params: AiraSessionSetModelParams): Promise<AiraSessionStateSnapshot>;
  setThoughtLevel(params: AiraSessionSetThoughtLevelParams): Promise<AiraSessionStateSnapshot>;
  setMode(params: AiraSessionSetModeParams): Promise<AiraSessionStateSnapshot>;
  respondProviderRuntimeHeaders(
    params: AiraSessionRespondProviderRuntimeHeadersParams,
  ): Promise<void>;
  // M5 删波次 2：onDynamicSessionEvent（旧 session/subscribe 词表的 renderer 订阅面）
  // 已删除——v4 UI 走 agentService 的 conversation/sessions-index 帧通道，
  // 该方法在 renderer 侧已无任何调用者（grep packages/ui packages/desktop 为零）。
}

export const IAiraSessionService = createServiceDescriptor<IAiraSessionService>(
  ServiceChannels.AiraSession,
);
