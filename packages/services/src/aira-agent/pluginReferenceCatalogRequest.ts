import {
  airaProtocolMethods,
  airaPluginsReferenceCatalogResultSchema,
  type AiraPluginsReferenceCatalogParams,
} from "@aira/shared";
import type { AiraProtocolClient } from "#src/aira-agent/airaProtocolClient.js";

/** 旧协议严格校验响应；新展示字段走独立入口，只有 -32601 能证明旧 Agent 不支持。 */
export async function requestPluginReferenceCatalog(
  client: Pick<AiraProtocolClient, "request">,
  params: AiraPluginsReferenceCatalogParams,
) {
  try {
    return await client.request(
      airaProtocolMethods.pluginsReferenceCatalogWithCategory,
      params,
      airaPluginsReferenceCatalogResultSchema,
    );
  } catch (error) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === -32601))
      throw error;
    return client.request(
      airaProtocolMethods.pluginsReferenceCatalog,
      params,
      airaPluginsReferenceCatalogResultSchema,
    );
  }
}
