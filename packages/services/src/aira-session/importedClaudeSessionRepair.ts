import type { AiraSessionStateSnapshot } from "@aira/shared";
import { createServiceLogger } from "#src/logger/serviceLogger.js";
import { repairImportedClaudeSessionSnapshot } from "#src/session/claude-native/importedClaudeHistoryRepair.js";
import type { IAiraAgentService } from "#src/aira-agent/airaAgent.js";
import type {
  AiraSessionReadParams,
  AiraSessionResumeParams,
} from "#src/aira-session/airaSession.js";

const logger = createServiceLogger("aira-session-service");

export async function repairEmptyImportedClaudeSessionSnapshot(params: {
  agentService: IAiraAgentService;
  snapshot: AiraSessionStateSnapshot;
  target: AiraSessionResumeParams | AiraSessionReadParams;
}): Promise<AiraSessionStateSnapshot> {
  const repaired = await repairImportedClaudeSessionSnapshot({
    snapshot: params.snapshot,
    target: {
      workspacePath: params.target.workspacePath,
      workspaceIdentity: params.target.workspaceIdentity,
      taskId: params.target.sessionId,
      ...("mcpServers" in params.target && params.target.mcpServers
        ? { mcpServers: params.target.mcpServers }
        : {}),
    },
    createSession: (input) => params.agentService.createSession(input),
    onRepair: (history) => {
      logger.warn(
        undefined,
        `[aira-session-service] Claude 导入 session 历史异常，按 ${history.source} 回填 taskId=${params.target.sessionId}`,
      );
    },
  });
  return repaired ?? params.snapshot;
}
