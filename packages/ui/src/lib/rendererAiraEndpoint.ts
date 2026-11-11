import {
  buildRuntimeAiraEndpointUrls,
  AIRA_ENV,
  type RuntimeAiraEndpointEnv,
} from "@aira/shared";

interface RendererImportMetaEnv {
  VITE_AIRA_BASE_URL?: string;
  VITE_AIRA_ENDPOINT_ORIGIN?: string;
}

function readRendererImportMetaEnv(): RendererImportMetaEnv {
  return ((import.meta as ImportMeta & { env?: RendererImportMetaEnv }).env ??
    {}) as RendererImportMetaEnv;
}

function createRendererAiraEndpointEnv(
  env: RendererImportMetaEnv = readRendererImportMetaEnv(),
): RuntimeAiraEndpointEnv {
  return {
    AIRA_ENV,
    // UI 侧的 aira-plan 占位 provider 以前只看 AIRA_ENV，
    // 没有消费 Vite 注入的 base url，导致自定义测试域名时 renderer 和 host/service 可能不一致。
    AIRA_BASE_URL: env.VITE_AIRA_BASE_URL,
    AIRA_ENDPOINT_ORIGIN: env.VITE_AIRA_ENDPOINT_ORIGIN,
  };
}

export const RENDERER_AIRA_ENDPOINT_URLS = buildRuntimeAiraEndpointUrls(
  createRendererAiraEndpointEnv(),
);
