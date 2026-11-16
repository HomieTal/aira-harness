/**
 * Aira Agent Slash Commands 便捷 hook
 *
 * 返回当前 workspace 下 Agent 广播的可用 slash commands 列表。
 */
import { useAiraSessionStore, selectWorkspaceAiraState } from "../store/airaSessionStore.js";

export function useSlashCommands(workspacePath: string, workspaceIdentity?: string) {
  return useAiraSessionStore(
    (state) => selectWorkspaceAiraState(state, workspacePath, workspaceIdentity).slashCommands,
  );
}
