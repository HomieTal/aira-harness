import { materializeAiraBuiltinProviderConfig } from "@aira/services/node";

declare const __AIRA_BUILTIN_PROVIDER_CONFIG_JSON__: string | undefined;

export interface MaterializeBundledAiraBuiltinProviderConfigOptions {
  readonly environmentConfigRoot: string;
  readonly content: string;
}

/** 返回构建时嵌入远端 Server 的 Aira Built-in Provider Config。 */
export function readBundledAiraBuiltinProviderConfig(): string {
  if (typeof __AIRA_BUILTIN_PROVIDER_CONFIG_JSON__ !== "string") {
    throw new Error("当前构建未嵌入 Aira Built-in Provider Config");
  }
  return __AIRA_BUILTIN_PROVIDER_CONFIG_JSON__;
}

/**
 * 将 Aira Built-in Config 原子物化到所属环境的固定资源副本。
 * 升级前退出旧进程；不保留按内容 hash 增长的历史文件。
 */
export async function materializeBundledAiraBuiltinProviderConfig(
  options: MaterializeBundledAiraBuiltinProviderConfigOptions,
): Promise<string> {
  return materializeAiraBuiltinProviderConfig(options);
}
