import type { AiraEnv } from "./env.js";

export const DEFAULT_AIRA_ENDPOINT_ORIGIN = "https://zcode.z.ai";
export const DEFAULT_BIGMODEL_API_ORIGIN = "https://bigmodel.cn";
export const DEFAULT_AIRA_OAUTH_ORIGIN = "https://chat.z.ai";
export const DEFAULT_AIRA_BUSINESS_BASE_URL = "https://api.z.ai";
export const DEFAULT_AIRA_OAUTH_CLIENT_ID = "client_P8X5CMWmlaRO9gyO-KSqtg";

// 构建仅注入公开链接；Node 调用方仍可显式传 env，避免读取另一进程的配置。
declare const __AIRA_ENDPOINT_ENV__: Record<string, string | undefined> | undefined;
export function pickProductEndpointEnv(
  env: Record<string, string | undefined>,
): Record<string, string> {
  const keys = [
    "AIRA_BASE_URL",
    "AIRA_ENDPOINT_ORIGIN",
    "BIGMODEL_API_BASE_URL",
    "AIRA_OAUTH_ORIGIN",
    "AIRA_BUSINESS_BASE_URL",
    "AIRA_OAUTH_CLIENT_ID",
    "AIRA_OAUTH_APP_ID",
  ];
  return Object.fromEntries(
    keys.flatMap((key) => (env[key]?.trim() ? [[key, env[key]!.trim()]] : [])),
  );
}
export function readProductEndpointEnv(): Record<string, string | undefined> {
  return {
    ...(typeof __AIRA_ENDPOINT_ENV__ === "undefined" ? {} : __AIRA_ENDPOINT_ENV__),
    ...pickProductEndpointEnv(typeof process === "undefined" ? {} : process.env),
  };
}

export interface AiraEndpointUrls {
  origin: string;
  apiBaseUrl: string;
  webShareCallbackUrl: string;
  airaPlanOpenAiBaseUrl: string;
  airaPlanAnthropicBaseUrl: string;
  airaPlanBillingCurrentUrl: string;
  airaPlanBillingBalanceUrl: string;
}

export interface RuntimeAiraEndpointEnv {
  [key: string]: string | undefined;
  AIRA_ENV?: string;
  AIRA_BASE_URL?: string;
  AIRA_ENDPOINT_ORIGIN?: string;
}

export interface RuntimeBigModelApiEnv {
  [key: string]: string | undefined;
  AIRA_ENV?: string;
  BIGMODEL_API_BASE_URL?: string;
}

export interface RuntimeAiraOAuthEndpointEnv {
  [key: string]: string | undefined;
  AIRA_ENV?: string;
  AIRA_OAUTH_ORIGIN?: string;
  AIRA_BUSINESS_BASE_URL?: string;
  AIRA_OAUTH_CLIENT_ID?: string;
  AIRA_OAUTH_APP_ID?: string;
}

export interface RuntimeProductEndpointEnv
  extends RuntimeAiraEndpointEnv, RuntimeBigModelApiEnv, RuntimeAiraOAuthEndpointEnv {}

export interface RuntimeProductEndpointConfig {
  airaEnv: AiraEnv;
  airaEndpointOrigin: string;
  airaEndpointUrls: AiraEndpointUrls;
  airaOAuthOrigin: string;
  airaBusinessBaseUrl: string;
  airaOAuthClientId: string;
  bigModelApiOrigin: string;
}

function readRuntimeEnvValue(
  env: Record<string, string | undefined>,
  key: string,
): string | undefined {
  const value = env[key]?.trim();
  return value ? value : undefined;
}

export function normalizeAiraEndpointOrigin(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Aira endpoint origin is empty");
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Aira endpoint origin must use http or https");
  }
  return parsed.origin;
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function isTrustedCodingPlanWebviewOrigin(
  value: string | null | undefined,
  options?: {
    e2eStoreBridgeEnabled?: boolean;
  },
): boolean {
  if (!value) return false;
  try {
    const origin = normalizeAiraEndpointOrigin(value);
    if (
      origin === DEFAULT_AIRA_ENDPOINT_ORIGIN ||
      origin === resolveRuntimeAiraEndpointOrigin()
    ) {
      return true;
    }
    const parsed = new URL(origin);
    return options?.e2eStoreBridgeEnabled === true && isLoopbackHostname(parsed.hostname);
  } catch {
    return false;
  }
}

export function resolveAiraEndpointOrigin(options?: {
  env?: AiraEnv;
  envBaseOrigin?: string | null;
  overrideOrigin?: string | null;
}): string {
  const origin = options?.overrideOrigin?.trim() || options?.envBaseOrigin?.trim();
  return origin ? normalizeAiraEndpointOrigin(origin) : DEFAULT_AIRA_ENDPOINT_ORIGIN;
}

export function resolveRuntimeAiraEnv(
  env: RuntimeAiraEndpointEnv = readProductEndpointEnv(),
): AiraEnv {
  // 产品身份仅用于既有展示与安装标识，不参与地址解析。
  return env.AIRA_ENV?.trim().toLowerCase() === "test" ? "test" : "production";
}

export function resolveRuntimeAiraEndpointOrigin(
  env: RuntimeAiraEndpointEnv = readProductEndpointEnv(),
  options?: { overrideOrigin?: string | null },
): string {
  return resolveAiraEndpointOrigin({
    envBaseOrigin:
      readRuntimeEnvValue(env, "AIRA_BASE_URL") ??
      readRuntimeEnvValue(env, "AIRA_ENDPOINT_ORIGIN"),
    overrideOrigin: options?.overrideOrigin,
  });
}

export function buildRuntimeAiraEndpointUrls(
  env: RuntimeAiraEndpointEnv = readProductEndpointEnv(),
): AiraEndpointUrls {
  return buildAiraEndpointUrls(resolveRuntimeAiraEndpointOrigin(env));
}

export function buildRuntimeAiraApiUrl(
  env: RuntimeAiraEndpointEnv = readProductEndpointEnv(),
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveRuntimeAiraEndpointOrigin(env)}${normalizedPath}`;
}

export function resolveBigModelApiOrigin(
  env: RuntimeBigModelApiEnv = readProductEndpointEnv(),
): string {
  return normalizeAiraEndpointOrigin(
    readRuntimeEnvValue(env, "BIGMODEL_API_BASE_URL") ?? DEFAULT_BIGMODEL_API_ORIGIN,
  );
}

export function buildBigModelApiUrl(
  env: RuntimeBigModelApiEnv = readProductEndpointEnv(),
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveBigModelApiOrigin(env)}${normalizedPath}`;
}

export function buildBigModelCodingPlanPersonalManageUrl(
  env: RuntimeBigModelApiEnv = readProductEndpointEnv(),
): string {
  // 管理页与业务 API 共用显式 origin，避免把已登录账号带到另一个部署。
  return buildBigModelApiUrl(env, "/coding-plan/personal/overview");
}

export function buildBigModelCodingPlanTeamManageUrl(
  env: RuntimeBigModelApiEnv = readProductEndpointEnv(),
): string {
  return buildBigModelApiUrl(env, "/coding-plan/team/plans");
}

export function resolveAiraOAuthOrigin(
  env: RuntimeAiraOAuthEndpointEnv = readProductEndpointEnv(),
): string {
  return normalizeAiraEndpointOrigin(
    readRuntimeEnvValue(env, "AIRA_OAUTH_ORIGIN") ?? DEFAULT_AIRA_OAUTH_ORIGIN,
  );
}

export function resolveAiraBusinessBaseUrl(
  env: RuntimeAiraOAuthEndpointEnv = readProductEndpointEnv(),
): string {
  return normalizeAiraEndpointOrigin(
    readRuntimeEnvValue(env, "AIRA_BUSINESS_BASE_URL") ?? DEFAULT_AIRA_BUSINESS_BASE_URL,
  );
}

export function resolveAiraOAuthClientId(
  env: RuntimeAiraOAuthEndpointEnv = readProductEndpointEnv(),
): string {
  return (
    readRuntimeEnvValue(env, "AIRA_OAUTH_CLIENT_ID") ??
    readRuntimeEnvValue(env, "AIRA_OAUTH_APP_ID") ??
    DEFAULT_AIRA_OAUTH_CLIENT_ID
  );
}

export function buildAiraOAuthUrl(origin: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizeAiraEndpointOrigin(origin)}${normalizedPath}`;
}

export function buildRuntimeAiraOAuthUrl(
  env: RuntimeAiraOAuthEndpointEnv = readProductEndpointEnv(),
  path: string,
): string {
  return buildAiraOAuthUrl(resolveAiraOAuthOrigin(env), path);
}

export function buildRuntimeAiraBusinessUrl(
  env: RuntimeAiraOAuthEndpointEnv = readProductEndpointEnv(),
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveAiraBusinessBaseUrl(env)}${normalizedPath}`;
}

export function resolveRuntimeProductEndpointConfig(
  env: RuntimeProductEndpointEnv = readProductEndpointEnv(),
): RuntimeProductEndpointConfig {
  const airaEnv = resolveRuntimeAiraEnv(env);
  const airaEndpointOrigin = resolveRuntimeAiraEndpointOrigin(env);

  return {
    airaEnv,
    airaEndpointOrigin,
    airaEndpointUrls: buildAiraEndpointUrls(airaEndpointOrigin),
    airaOAuthOrigin: resolveAiraOAuthOrigin(env),
    airaBusinessBaseUrl: resolveAiraBusinessBaseUrl(env),
    airaOAuthClientId: resolveAiraOAuthClientId(env),
    bigModelApiOrigin: resolveBigModelApiOrigin(env),
  };
}

export function buildAiraEndpointUrls(origin: string): AiraEndpointUrls {
  const normalizedOrigin = normalizeAiraEndpointOrigin(origin);
  return {
    origin: normalizedOrigin,
    apiBaseUrl: `${normalizedOrigin}/api/v1`,
    webShareCallbackUrl: `${normalizedOrigin}/cn/share/callback`,
    airaPlanOpenAiBaseUrl: `${normalizedOrigin}/api/v1/aira-plan`,
    airaPlanAnthropicBaseUrl: `${normalizedOrigin}/api/v1/aira-plan/anthropic`,
    airaPlanBillingCurrentUrl: `${normalizedOrigin}/api/v1/aira-plan/billing/current`,
    airaPlanBillingBalanceUrl: `${normalizedOrigin}/api/v1/aira-plan/billing/balance`,
  };
}

export function rewriteAiraEndpointUrl(input: string | URL, endpointOrigin: string): string | URL {
  const originalUrl = typeof input === "string" ? input : input.toString();
  let parsed: URL;
  try {
    parsed = new URL(originalUrl);
  } catch {
    return input;
  }
  const sourceOrigin = DEFAULT_AIRA_ENDPOINT_ORIGIN;
  if (parsed.origin !== sourceOrigin) {
    return input;
  }

  const targetOrigin = normalizeAiraEndpointOrigin(endpointOrigin);
  if (targetOrigin === sourceOrigin) {
    return input;
  }

  const target = new URL(targetOrigin);
  target.pathname = parsed.pathname;
  target.search = parsed.search;
  target.hash = parsed.hash;
  return target.toString();
}
