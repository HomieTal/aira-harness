import {
  createLocalServices,
  getAppConfigDir,
  type AiraAgentCommandResolver,
} from "@aira/services/node";
import { createServerCredentialCipher } from "@aira/shared/credential-security";
import { join } from "node:path";
import type { IChannel } from "@aira/rpc";
import {
  parseServiceAuthorityMode,
  AIRA_REMOTE_HTTP_PROXY_ENV_KEY,
  AIRA_REMOTE_NO_PROXY_ENV_KEY,
  AIRA_REMOTE_RUNTIME_NETWORK_AUTHORITY_ENV_KEY,
} from "@aira/shared";

export interface CreateStdioServicesOptions {
  topicResourceRelayChannel?: () => IChannel;
  env?: Record<string, string | undefined>;
  airaBuiltinProviderConfigFilePath: string;
  airaAgentCommandResolver?: AiraAgentCommandResolver;
}

export interface RemoteAgentNetworkOptions {
  httpProxy?: string;
  noProxy?: string;
}

export function resolveRemoteAgentNetworkFromEnv(
  env: Record<string, string | undefined>,
): RemoteAgentNetworkOptions | undefined {
  if (env[AIRA_REMOTE_RUNTIME_NETWORK_AUTHORITY_ENV_KEY]?.trim() !== "1") {
    return undefined;
  }
  return {
    httpProxy: env[AIRA_REMOTE_HTTP_PROXY_ENV_KEY]?.trim() || undefined,
    noProxy: env[AIRA_REMOTE_NO_PROXY_ENV_KEY]?.trim() || undefined,
  };
}

export async function createStdioServices(options: CreateStdioServicesOptions) {
  const env = options.env ?? process.env;
  const authorityModeParseResult = parseServiceAuthorityMode(env);
  const remoteAgentNetwork = resolveRemoteAgentNetworkFromEnv(env);
  // 旧 stdio 入口也必须在发布 ready 前验证存储，不能在同步到一半时才失败。
  const credentialCipherProvider = await createServerCredentialCipher({
    filePath: join(getAppConfigDir(), "credentials.json"),
    env,
  });
  // 远程 Desktop 的呈现能力必须从 stdio 入口收到的 authority mode 进入 Services 推导链。
  // 测试注入 resolver 只用于在 spawn 前观察最终命令，不改变生产默认 resolver。
  const services = createLocalServices({
    credentialCipherProvider,
    airaBuiltinProviderConfigFilePath: options.airaBuiltinProviderConfigFilePath,
    topicResourceRelayChannel: options.topicResourceRelayChannel,
    serviceAuthorityMode: authorityModeParseResult.mode,
    airaAgentCommandResolver: options.airaAgentCommandResolver,
    remoteAgentNetwork,
  });

  return {
    authorityModeParseResult,
    services,
  };
}
