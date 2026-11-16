import type { RequestVerificationReason } from "@aira/shared";
import { createHash } from "node:crypto";
import {
  BIGMODEL_PROVIDER_ID,
  type OAuthProviderId,
  type ProviderFamilyDomain,
  type ProjectAccessTokenMaterial,
  type AiraAccountAccess,
  type AiraProviderAccountAccess,
  ZAI_PROVIDER_ID,
} from "@aira/shared";

export interface AccountRequestAuthMaterial {
  /** 私有传输字段兼容旧命名；套餐 OAuth 实际传入短期 Project Token。 */
  apiKey?: string;
  apiKeyId?: string;
  headers?: Record<string, string>;
  accountScope?: string;
}

export interface AccountRequestAuthInput {
  providerId: string;
  modelId?: string;
  accountAccess: AiraProviderAccountAccess | AiraAccountAccess;
  expectedAccountScope?: string;
  rejectedProjectTokenFingerprint?: string;
  reason: RequestVerificationReason | "off-peak" | "usage";
}

export interface AccountAccessIdentityInput {
  providerId: string;
  accountAccess: AiraProviderAccountAccess | AiraAccountAccess;
}

export class AccountRequestCredentialUnavailableError extends Error {
  constructor(readonly providerId: string) {
    super(`Account request credential is unavailable: ${providerId}`);
    this.name = "AccountRequestCredentialUnavailableError";
  }
}

export interface AccountRequestAuthResolver {
  resolveAccessCurrent(access: AiraProviderAccountAccess): Promise<AiraAccountAccess | null>;
  resolveCurrent(input: AccountRequestAuthInput): Promise<AccountRequestAuthMaterial>;
  assertCurrent(input: AccountAccessIdentityInput): Promise<void>;
}

interface AccountProviderRequestAuthServiceOptions {
  resolveCurrentAccountAccess(
    access: AiraProviderAccountAccess,
  ): Promise<AiraAccountAccess | null>;
  loadOAuthTokenSet(providerId: OAuthProviderId): Promise<{
    accessToken?: string | null;
    airaJwtToken?: string | null;
    sessionRevision?: string | null;
    accountIdentity?: string;
    airaUserId?: string;
  } | null>;
  /** Start 只用共享 Aira JWT；不经过付费套餐的家族 token set。 */
  loadStartPlanAiraJwt(family: ProviderFamilyDomain): Promise<string | null>;
  loadIndividualPlanMaterial(
    providerId: string,
    family: ProviderFamilyDomain,
    rejectedProjectTokenFingerprint?: string,
  ): Promise<ProjectAccessTokenMaterial | null>;
  resolveTeamPlanMaterial(
    access: Extract<AiraAccountAccess, { planKind: "team-coding-plan" }>,
    rejectedProjectTokenFingerprint?: string,
  ): Promise<ProjectAccessTokenMaterial | null>;
}

class AccountProviderRequestAuthService implements AccountRequestAuthResolver {
  readonly #options: AccountProviderRequestAuthServiceOptions;

  constructor(options: AccountProviderRequestAuthServiceOptions) {
    this.#options = options;
  }

  resolveAccessCurrent(access: AiraProviderAccountAccess): Promise<AiraAccountAccess | null> {
    return this.#options.resolveCurrentAccountAccess(access);
  }

  async resolveCurrent(input: AccountRequestAuthInput): Promise<AccountRequestAuthMaterial> {
    const providerId = input.providerId.trim();
    const access = await this.#resolveAccess(input.accountAccess);
    if (!access) throw new AccountRequestCredentialUnavailableError(providerId);

    if (access.planKind === "start-plan") {
      // Bug 原因：曾从家族 token set 取 JWT，国内无关联账号没有家族材料，Start 调用拿不到凭据。
      return {
        apiKey: requireApiKey(await this.#options.loadStartPlanAiraJwt(access.family), providerId),
      };
    }

    const scoped = input.reason !== "usage" || input.expectedAccountScope !== undefined;
    if (input.rejectedProjectTokenFingerprint && !input.expectedAccountScope)
      throw new Error("project_token_scope_invalidated");
    const accountScope = scoped ? await this.#scope(access) : undefined;
    if (input.expectedAccountScope !== undefined && input.expectedAccountScope !== accountScope)
      throw new Error("project_token_scope_invalidated");
    const material =
      access.planKind === "individual-coding-plan"
        ? await this.#options.loadIndividualPlanMaterial(
            providerId,
            access.family,
            input.rejectedProjectTokenFingerprint,
          )
        : await this.#options.resolveTeamPlanMaterial(
            access,
            input.rejectedProjectTokenFingerprint,
          );
    if (scoped) {
      // 换证 IO 前后校验原请求身份，避免 401 重试或闲时票据串用新账号/项目。
      const latest = await this.#resolveAccess(input.accountAccess);
      if (!latest || accountScope !== (await this.#scope(latest)))
        throw new Error("project_token_scope_invalidated");
    }
    return {
      apiKey: requireApiKey(material?.token, providerId),
      apiKeyId: material?.apiKeyId,
      ...(accountScope ? { accountScope } : {}),
    };
  }

  async #scope(access: AiraAccountAccess): Promise<string> {
    const login = await this.#options.loadOAuthTokenSet(resolveOAuthProviderId(access.family));
    if (!login?.accessToken?.trim())
      throw new AccountRequestCredentialUnavailableError(access.family);
    return createHash("sha256")
      .update(
        JSON.stringify([
          access.family,
          access.planKind,
          access.planKind === "team-coding-plan"
            ? [access.organizationId, access.projectId, access.productId]
            : null,
          login.accessToken.trim(),
          login.airaJwtToken?.trim() ?? null,
          login.sessionRevision ?? null,
          login.accountIdentity ?? null,
          login.airaUserId ?? null,
        ]),
      )
      .digest("hex");
  }

  async assertCurrent(input: AccountAccessIdentityInput): Promise<void> {
    if (!(await this.#resolveAccess(input.accountAccess))) {
      throw new AccountRequestCredentialUnavailableError(input.providerId);
    }
  }

  #resolveAccess(
    access: AiraProviderAccountAccess | AiraAccountAccess,
  ): Promise<AiraAccountAccess | null> {
    return "mode" in access
      ? this.#options.resolveCurrentAccountAccess(access)
      : Promise.resolve(access);
  }
}

function resolveOAuthProviderId(family: ProviderFamilyDomain): OAuthProviderId {
  return family === "zai" ? ZAI_PROVIDER_ID : BIGMODEL_PROVIDER_ID;
}

function requireApiKey(value: string | null | undefined, providerId: string): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    throw new AccountRequestCredentialUnavailableError(providerId);
  }
  return normalized;
}

export function createAccountProviderRequestAuthService(
  options: AccountProviderRequestAuthServiceOptions,
): AccountProviderRequestAuthService {
  return new AccountProviderRequestAuthService(options);
}
