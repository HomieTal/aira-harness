import { buildRuntimeAiraApiUrl, resolveAiraBusinessBaseUrl } from "@aira/shared";

export const AIRA_CLIENT_SCENES_URL = buildRuntimeAiraApiUrl(
  process.env,
  "/api/v1/client/scenes",
);

export const AIRA_API_HOST = resolveAiraBusinessBaseUrl(process.env);
