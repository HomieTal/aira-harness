import type { WorkspacePurpose, AiraTaskMeta } from "@aira/shared";

export type AiraTaskListKind = "pinned" | "archived" | "timeline" | "active";
export type AiraTaskListSortBy = "created" | "updated";

export interface AiraTaskListWorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string;
  workspacePurpose?: WorkspacePurpose;
}

export interface AiraTaskListQuery {
  kind: AiraTaskListKind | "all";
  /** host 由存储 owner 确定全部范围，不接受 UI 已打开工作区作为历史目录。 */
  workspaceScopes: AiraTaskListWorkspaceScope[] | "host";
  sortBy: AiraTaskListSortBy;
  search?: string;
  limit?: number;
  /** 只返回这些会话（例如分享管理按来源会话 ID 解析跳转目标）；空数组返回空结果。 */
  taskIds?: readonly string[];
}

export type AiraTaskListItem = AiraTaskMeta & {
  searchSnippet?: string;
  searchSnippets?: string[];
};

export interface AiraTaskListResult {
  items: AiraTaskListItem[];
  total: number;
  hasMore: boolean;
}

export interface AiraWorkspaceEventSubscriptionParams {
  workspacePath: string;
  workspaceIdentity?: string;
}
