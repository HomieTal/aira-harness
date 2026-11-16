import {
  AIRA_AGENT_PROVIDER,
  AIRA_AGENT_PROVIDER_LABEL,
  type AiraProvider,
} from "@aira/shared";

export const AIRA_AGENT_PROVIDERS: AiraProvider[] = [AIRA_AGENT_PROVIDER];

export const AIRA_AGENT_PROVIDER_LABELS: Record<AiraProvider, string> = {
  glm: AIRA_AGENT_PROVIDER_LABEL,
};

export function supportsAiraSessionFork(provider: AiraProvider): boolean {
  void provider;
  // 功能开关：fork 入口恢复对所有 Aira provider 开放；实际可操作性仍由 task 状态、
  // assistant 目标和运行中保护 guard 控制，避免把 active/failed 分支暴露为可 fork。
  return true;
}

export function shouldHideAiraSessionForkAction(provider: AiraProvider): boolean {
  return !supportsAiraSessionFork(provider);
}
