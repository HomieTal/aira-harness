import { z } from "zod";

/**
 * Aira agent 提供方的单一真源。
 *
 * 类型 AiraProvider、运行时 schema airaProviderSchema 都从这里派生,
 * 避免各处内联 z.enum([...]) 副本随新增/删除 provider 漂移。
 * 本模块只依赖 zod(叶子),可被 validation / aira-protocol 等无环引用。
 */
const AIRA_PROVIDERS = ["glm"] as const;

export const airaProviderSchema = z.enum(AIRA_PROVIDERS);

export type AiraProvider = (typeof AIRA_PROVIDERS)[number];
