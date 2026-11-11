import {
  AIRA_PROVIDER_ID,
  buildRuntimeAiraBusinessUrl,
  buildRuntimeAiraOAuthUrl,
  resolveAiraOAuthClientId,
} from "@aira/shared";
import type { OAuthProviderRuntimeConfig } from "../runtimeConfig.js";
import {
  buildDesktopOAuthRedirectUriFromEnv,
  buildAiraApiUrlFromEnv,
  readBoolean,
  readEnv,
} from "./configUtils.js";

const AIRA_OAUTH_PROVIDER_CONFIG: Omit<OAuthProviderRuntimeConfig, "appSecret"> = {
  id: AIRA_PROVIDER_ID,
  displayName: "Aira AI",
  enabled: true,
  order: 1,
  // ZAI 当前 OAuth 授权入口使用 /api/oauth 前缀，继续走 /auth/oauth 会打开旧入口。
  authorizeUrl: "https://chat.z.ai/api/oauth/authorize",
  tokenUrl: "https://zcode.z.ai/api/v1/oauth/token",
  userinfoUrl: "https://chat.z.ai/api/oauth/userinfo",
  businessLoginUrl: "https://api.z.ai/api/auth/z/login",
  // 生产 client_id 不是 secret，但保留 fallback 可以避免未配置 env 的旧构建直接无法登录。
  appId: "client_P8X5CMWmlaRO9gyO-KSqtg",
  redirectUri: "aira://oauth/callback",
};

export function createAiraProviderRuntimeConfig(env: NodeJS.ProcessEnv): OAuthProviderRuntimeConfig {
  return {
    ...AIRA_OAUTH_PROVIDER_CONFIG,
    enabled: readBoolean(env, "AIRA_OAUTH_ENABLED", AIRA_OAUTH_PROVIDER_CONFIG.enabled),
    authorizeUrl:
      readEnv(env, "AIRA_OAUTH_AUTHORIZE_URL") ??
      buildRuntimeAiraOAuthUrl(env, "/api/oauth/authorize"),
    tokenUrl:
      readEnv(env, "AIRA_OAUTH_TOKEN_URL") ?? buildAiraApiUrlFromEnv(env, "/api/v1/oauth/token"),
    userinfoUrl: resolveAiraUserinfoUrl(env),
    businessLoginUrl:
      readEnv(env, "AIRA_BUSINESS_LOGIN_URL") ??
      buildRuntimeAiraBusinessUrl(env, "/api/auth/z/login"),
    appId:
      // client_id 是公开 OAuth app 标识，按环境覆盖，避免测试/生产 OAuth 应用混用。
      resolveAiraOAuthClientId(env),
    redirectUri: buildDesktopOAuthRedirectUriFromEnv(env),
  };
}

export function resolveAiraUserinfoUrl(env: NodeJS.ProcessEnv): string {
  return (
    readEnv(env, "AIRA_OAUTH_USERINFO_URL") ?? buildRuntimeAiraOAuthUrl(env, "/api/oauth/userinfo")
  );
}
