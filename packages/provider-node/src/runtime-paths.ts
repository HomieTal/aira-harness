export const AIRA_BUILTIN_PROVIDER_CONFIG_FILE_ENV = "AIRA_BUILTIN_PROVIDER_CONFIG_FILE";
export const AIRA_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE_ENV =
  "AIRA_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE";
export const AIRA_PERSONAL_PROVIDER_CONFIG_FILE_ENV = "AIRA_PERSONAL_PROVIDER_CONFIG_FILE";
export const PERSONAL_PROVIDER_CONFIG_FILE_NAME = "provider_config.json";

export interface NodeProviderRuntimePaths {
  readonly airaBuiltinFilePath: string;
  readonly personalFilePath: string;
}

export function createNodeProviderRuntimePathEnv(
  paths: NodeProviderRuntimePaths,
): Record<string, string> {
  return {
    [AIRA_BUILTIN_PROVIDER_CONFIG_FILE_ENV]: paths.airaBuiltinFilePath,
    [AIRA_PERSONAL_PROVIDER_CONFIG_FILE_ENV]: paths.personalFilePath,
  };
}

export function resolveNodeProviderRuntimePaths(
  env: Readonly<Record<string, string | undefined>>,
): NodeProviderRuntimePaths | null {
  const airaBuiltinFilePath = env[AIRA_BUILTIN_PROVIDER_CONFIG_FILE_ENV]?.trim();
  const personalFilePath = env[AIRA_PERSONAL_PROVIDER_CONFIG_FILE_ENV]?.trim();
  if (!airaBuiltinFilePath && !personalFilePath) return null;
  if (!airaBuiltinFilePath || !personalFilePath) {
    throw new Error("Aira Built-in 与 Personal Provider Config 路径必须同时提供");
  }
  return Object.freeze({ airaBuiltinFilePath, personalFilePath });
}
