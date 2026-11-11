import type { ApiClient } from "@aira/shared";
import { readApiJson } from "./api/apiJson.js";

const AIRA_BUSINESS_TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000;

interface AiraBusinessLoginEnvelope {
  code?: number;
  msg?: string;
  success?: boolean;
  data?: {
    access_token?: string;
    accessToken?: string;
    expires_in?: number;
  } | null;
}

interface CachedAiraBusinessToken {
  oauthAccessToken: string;
  accessToken: string;
  expiresAt: number;
}

interface AiraBusinessTokenResolverOptions {
  apiClient: ApiClient;
  loginUrl: string;
  timeoutMs: number;
  now?: () => number;
}

export class AiraBusinessTokenResolver {
  private readonly apiClient: ApiClient;
  private readonly loginUrl: string;
  private readonly timeoutMs: number;
  private readonly now: () => number;
  private cachedToken: CachedAiraBusinessToken | null = null;

  constructor(options: AiraBusinessTokenResolverOptions) {
    this.apiClient = options.apiClient;
    this.loginUrl = options.loginUrl;
    this.timeoutMs = options.timeoutMs;
    this.now = options.now ?? Date.now;
  }

  async resolve(oauthAccessToken: string): Promise<string> {
    const normalizedToken = oauthAccessToken.trim();
    if (!normalizedToken) {
      throw new Error("zai_oauth_required");
    }

    const cachedToken = this.cachedToken;
    if (this.isCachedTokenValid(cachedToken, normalizedToken)) {
      return cachedToken.accessToken;
    }

    this.cachedToken = null;
    return this.exchangeBusinessToken(normalizedToken);
  }

  private isCachedTokenValid(
    cachedToken: CachedAiraBusinessToken | null,
    oauthAccessToken: string,
  ): cachedToken is CachedAiraBusinessToken {
    return Boolean(
      cachedToken &&
      cachedToken.oauthAccessToken === oauthAccessToken &&
      cachedToken.expiresAt - AIRA_BUSINESS_TOKEN_REFRESH_SKEW_MS > this.now(),
    );
  }

  private async exchangeBusinessToken(oauthAccessToken: string): Promise<string> {
    let payload: AiraBusinessLoginEnvelope;
    try {
      payload = await readApiJson<AiraBusinessLoginEnvelope>(this.apiClient, this.loginUrl, {
        method: "POST",
        timeoutMs: this.timeoutMs,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: oauthAccessToken }),
      });
    } catch {
      throw new Error("zai_oauth_required");
    }

    if (!isSuccessfulAiraBusinessCode(payload.code) || payload.success === false) {
      throw new Error("zai_oauth_required");
    }

    const accessToken =
      payload.data?.access_token?.trim() ?? payload.data?.accessToken?.trim() ?? "";
    if (!accessToken) {
      throw new Error("zai_oauth_required");
    }

    const expiresIn = payload.data?.expires_in;
    if (expiresIn && Number.isFinite(expiresIn)) {
      this.cachedToken = {
        oauthAccessToken,
        accessToken,
        expiresAt: this.now() + expiresIn * 1000,
      };
    }

    return accessToken;
  }
}

function isSuccessfulAiraBusinessCode(code: unknown): boolean {
  if (code === null || code === undefined) {
    return true;
  }
  if (typeof code === "number") {
    return code === 0 || code === 200;
  }
  if (typeof code === "string") {
    return code === "0" || code === "200";
  }
  return false;
}
