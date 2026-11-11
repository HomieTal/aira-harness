import type { WorkspacePurpose, AiraTaskMeta } from "@aira/shared";

export type AiraTaskListKind = "pinned" | "archived" | "timeline" | "active";
export type AiraTaskListSortBy = "created" | "updated";

export interface AiraTaskListWorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string;
  workspacePurpose?: WorkspacePurpose;
}

export interface AiraTaskListQuery {
  kind: AiraTaskListKind;
  workspaceScopes: AiraTaskListWorkspaceScope[];
  sortBy: AiraTaskListSortBy;
  search?: string;
  limit?: number;
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

export type AiraTaskGroupColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";

export interface AiraTaskGroup {
  id: string;
  title: string;
  color: AiraTaskGroupColor;
  createdAt: number;
  updatedAt: number;
}

export interface AiraGroupedTaskRef {
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
}

export type AiraGroupedTaskViewTopLevelNodeRef =
  | { type: "group"; groupId: string }
  | { type: "task"; task: AiraGroupedTaskRef };

export type AiraGroupedTaskViewNode =
  | {
      type: "group";
      group: AiraTaskGroup;
      tasks: AiraTaskListItem[];
      sortOrder?: number;
    }
  | {
      type: "task";
      task: AiraTaskListItem;
      sortOrder?: number;
    };

export interface AiraGroupedTaskView {
  nodes: AiraGroupedTaskViewNode[];
}

export interface AiraGroupedTaskViewQuery {
  workspaceScopes: AiraTaskListWorkspaceScope[];
  includeAllWorkspaces?: boolean;
}

// ── grouped 原始结构（不 join tasks 表）──
// grouped 视图的任务数据源迁到 sessions-index 后，服务端只提供分组结构
// （task_groups / task_group_members / task_group_view_node_orders），
// 由客户端与 sessions-index 会话做 join。

/** 组成员引用（不含任务 meta；task 内容由 sessions-index 提供）。 */
export interface AiraGroupedTaskViewStructureMember {
  groupId: string;
  /** 服务端口径 workspaceKey（resolveWorkspaceKey：identity ?? path），join 匹配键。 */
  workspaceKey: string;
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string;
  /** null = 尚未落 sort_order（新加入组）；客户端按 addedAt 降序补内存序。 */
  sortOrder: number | null;
  addedAt: number;
}

/** 顶层节点排序（task_group_view_node_orders，node_key 已解析为结构化引用）。 */
export type AiraGroupedTaskViewStructureTopOrder =
  | { type: "group"; groupId: string; sortOrder: number }
  | { type: "task"; workspaceKey: string; taskId: string; sortOrder: number };

export interface AiraGroupedTaskViewStructure {
  /** 已按 workspaceScopes 可见性过滤的 group（bootstrap workspace group 只在其 workspace 可见）。 */
  groups: AiraTaskGroup[];
  /** 全量组成员（含不可见 group 的成员——顶层排除规则需要全量判断）。 */
  members: AiraGroupedTaskViewStructureMember[];
  topLevelOrders: AiraGroupedTaskViewStructureTopOrder[];
}

export interface AiraGroupedTaskViewOrderInput {
  workspaceScopes: AiraTaskListWorkspaceScope[];
  topLevelNodes: AiraGroupedTaskViewTopLevelNodeRef[];
  groups: Array<{
    groupId: string;
    taskRefs: AiraGroupedTaskRef[];
  }>;
}

export interface AiraWorkspaceEventSubscriptionParams {
  workspacePath: string;
  workspaceIdentity?: string;
}
