import { createLocalServices, getAppConfigDir } from "@aira/services/node";
import {
  materializeBundledAiraBuiltinProviderConfig,
  readBundledAiraBuiltinProviderConfig,
} from "./bundledAiraBuiltinProviderConfig.js";
import { createHttpServer } from "./http.js";

async function main(): Promise<void> {
  const airaBuiltinProviderConfigFilePath = await materializeBundledAiraBuiltinProviderConfig({
    environmentConfigRoot: getAppConfigDir(),
    content: readBundledAiraBuiltinProviderConfig(),
  });
  const port = Number(process.env["PORT"]) || 3030;
  const host = process.env["AIRA_SERVER_HOST"]?.trim() || process.env["HOST"]?.trim() || undefined;
  const staticRoot = process.env["AIRA_WEB_STATIC_ROOT"]?.trim() || undefined;
  const authToken = process.env["AIRA_SERVER_AUTH_TOKEN"]?.trim() || undefined;
  const services = createLocalServices({
    airaBuiltinProviderConfigFilePath,
    providerProvisioningTargetEnabled: Boolean(authToken),
  });

  createHttpServer(services, port, {
    ...(host ? { host } : {}),
    ...(staticRoot ? { staticRoot, spaFallback: true } : {}),
    ...(authToken ? { authToken, authRequired: true } : {}),
  });
}

void main().catch((error: unknown) => {
  console.error("[aira-server:http] startup failed", error);
  process.exitCode = 1;
});
