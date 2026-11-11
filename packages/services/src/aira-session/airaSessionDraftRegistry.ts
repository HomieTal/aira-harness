import type { AiraSessionStateSnapshot } from "@aira/shared";
import type {
  AiraSessionWorkspaceTarget,
  AiraTaskTarget,
} from "#src/aira-session/airaSession.js";

function getWorkspaceKey(target: AiraSessionWorkspaceTarget): string {
  return target.workspaceIdentity?.trim() || target.workspacePath;
}

function getSessionScopedKey(target: AiraTaskTarget): string {
  return `${getWorkspaceKey(target)}\0${target.sessionId}`;
}

export function createAiraDeferredDraftRegistry() {
  const sessionKeys = new Set<string>();

  return {
    remember(params: AiraSessionWorkspaceTarget, snapshot: AiraSessionStateSnapshot): void {
      sessionKeys.add(
        getSessionScopedKey({
          workspacePath: snapshot.session.workspace.workspacePath,
          workspaceIdentity:
            snapshot.session.workspace.workspaceIdentity ?? params.workspaceIdentity,
          sessionId: snapshot.session.sessionId,
        }),
      );
    },

    has(target: AiraTaskTarget): boolean {
      return sessionKeys.has(getSessionScopedKey(target));
    },

    forget(target: AiraTaskTarget): void {
      sessionKeys.delete(getSessionScopedKey(target));
    },
  };
}
