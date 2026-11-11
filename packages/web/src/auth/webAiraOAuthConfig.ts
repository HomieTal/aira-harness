import type { WebAiraOAuthProviderConfig } from "./airaWebOAuthProvider.js";
import {
  buildAiraEndpointUrls,
  DEFAULT_AIRA_ENDPOINT_ORIGIN,
  resolveBigModelApiOrigin,
} from "@aira/shared";

interface WebImportMetaEnv {
  VITE_DEV_ORIGIN?: string;
  VITE_AIRA_OAUTH_CLIENT_ID?: string;
  VITE_AIRA_OAUTH_ORIGIN?: string;
  VITE_BIGMODEL_OAUTH_ORIGIN?: string;
  VITE_BIGMODEL_OAUTH_APP_ID?: string;
  VITE_AIRA_BASE_URL?: string;
  VITE_AIRA_ENDPOINT_ORIGIN?: string;
  VITE_WEB_REMOTE_ALLOW_DEV_RETURN_TO?: string;
}

export interface WebAiraOAuthConfig extends WebAiraOAuthProviderConfig {
  devOrigin?: string;
  shareRedirectUri: string;
  allowDevReturnToRedirect: boolean;
}

function normalizeAiraOAuthOrigin(value: string): string {
  return new URL(value.trim()).origin;
}

function buildAiraOAuthAuthorizeUrl(origin: string | undefined): string {
  return `${normalizeAiraOAuthOrigin(origin?.trim() || "https://chat.z.ai")}/api/oauth/authorize`;
}

/**
 * BigModel 的授权入口。
 *
 * 必须跟随环境：测试环境写死 bigmodel.cn 会把测试账号带到生产授权页。构建期由
 * vite.config 用 resolveBigModelApiOrigin 注入 VITE_BIGMODEL_OAUTH_ORIGIN；这里的
 * resolveBigModelApiOrigin({}) 只是最后兜底（等价于生产 origin）。
 */
function buildBigModelAuthorizeUrl(origin: string | undefined): string {
  const trimmed = origin?.trim();
  return `${trimmed ? new URL(trimmed).origin : resolveBigModelApiOrigin({})}/login`;
}

function createWebAiraOAuthConfig(env: WebImportMetaEnv = {}): WebAiraOAuthConfig {
  const devOrigin = env.VITE_DEV_ORIGIN?.trim().replace(/\/$/, "");
  const airaEndpointUrls = buildAiraEndpointUrls(
    env.VITE_AIRA_BASE_URL?.trim() ||
      env.VITE_AIRA_ENDPOINT_ORIGIN?.trim() ||
      DEFAULT_AIRA_ENDPOINT_ORIGIN,
  );

  return {
    // ZAI 当前 OAuth 授权入口使用 /api/oauth 前缀，继续走 /auth/oauth 会打开旧入口。
    authorizeUrl: buildAiraOAuthAuthorizeUrl(env.VITE_AIRA_OAUTH_ORIGIN),
    tokenUrl: "/api/v1/oauth/token",
    // client_id 会出现在授权 URL 中，属于公开配置；这里允许 VITE_ 注入，但不能放 secret/token。
    clientId: env.VITE_AIRA_OAUTH_CLIENT_ID?.trim() || "client_P8X5CMWmlaRO9gyO-KSqtg",
    bigmodelAuthorizeUrl: buildBigModelAuthorizeUrl(env.VITE_BIGMODEL_OAUTH_ORIGIN),
    // BigModel 用 appId 而不是 client_id，且默认值就是桌面端在用的 "aira"。
    bigmodelAppId: env.VITE_BIGMODEL_OAUTH_APP_ID?.trim() || "aira",
    redirectUri: airaEndpointUrls.webShareCallbackUrl,
    shareRedirectUri: airaEndpointUrls.webShareCallbackUrl,
    ...(devOrigin ? { devOrigin } : {}),
    allowDevReturnToRedirect: env.VITE_WEB_REMOTE_ALLOW_DEV_RETURN_TO === "true",
  };
}

const env = ((import.meta as ImportMeta & { env?: WebImportMetaEnv }).env ??
  {}) as WebImportMetaEnv;

export const WEB_AIRA_OAUTH_CONFIG: WebAiraOAuthConfig = createWebAiraOAuthConfig(env);

export function resolveWebAuthDevReturnTo(config: WebAiraOAuthConfig): string | undefined {
  return config.devOrigin ? `${config.devOrigin}/share/callback` : undefined;
}
