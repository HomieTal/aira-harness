// `plugins/readUserOptions`：扩展 settings 能力读本插件 user 层的有效值（含敏感值）。
// 规格：docs/design/v2/plugin-compat.md「App 读取扩展设置」。
// 只给 App 用：不进模型可见的工具，也不记日志（值里有 secret）。
import {
  AIRA_PLUGIN_READ_USER_OPTIONS_ERROR_CODES,
  airaPluginsReadUserOptionsParamsSchema,
  type AiraPluginsReadUserOptionsResult,
} from "@aira/shared";
import type { PluginMetadata, PluginOptionValues } from "@aira/contracts";
import { createConfigWithPluginMigrations } from "@aira/adapters/config";
import { resolveAiraPlugins } from "../plugins.js";
import {
  ProtocolRequestError,
  parseParams,
  type AiraProtocolAgentServerContext,
} from "./server-types.js";

const INVALID_PARAMS_CODE = -32602;

export async function readPluginUserOptions(
  context: AiraProtocolAgentServerContext,
  rawParams: unknown,
): Promise<AiraPluginsReadUserOptionsResult> {
  const params = parseParams(airaPluginsReadUserOptionsParamsSchema, rawParams);
  context.deps?.pluginPreparation?.signal.throwIfAborted();
  // user 视图：不传 workingDirectory 就不加载任何项目配置层（扩展只认用户级，见扩展进程 §13）。
  const outcome = await resolveAiraPlugins({
    configResult: await createConfigWithPluginMigrations({ env: context.deps?.env }),
    logger: context.logger,
    pluginDiscovery: context.deps?.pluginDiscovery,
    pluginPreparation: context.deps?.pluginPreparation,
  });
  context.deps?.pluginPreparation?.signal.throwIfAborted();
  const plugin = outcome.plugins.find((item) => item.id === params.pluginId);
  if (!plugin) {
    throw new ProtocolRequestError(
      INVALID_PARAMS_CODE,
      `Plugin not installed: ${params.pluginId}`,
      {
        code: AIRA_PLUGIN_READ_USER_OPTIONS_ERROR_CODES.pluginNotFound,
      },
    );
  }
  return { values: { ...readUserConfigDefaults(plugin), ...plugin.configuredOptions } };
}

function readUserConfigDefaults(plugin: PluginMetadata): PluginOptionValues {
  const defaults: PluginOptionValues = {};
  for (const [key, option] of Object.entries(plugin.userConfig ?? {})) {
    if (option.default !== undefined) defaults[key] = option.default;
  }
  return defaults;
}
