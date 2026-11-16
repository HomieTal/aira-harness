import { buildRuntimeAiraApiUrl, resolveZaiBusinessBaseUrl } from "@aira/shared";

export const AIRA_CLIENT_SCENES_URL = buildRuntimeAiraApiUrl(
  process.env,
  "/api/v1/client/scenes",
);

export const ZAI_API_HOST = resolveZaiBusinessBaseUrl(process.env);
