import type { IDisposable } from "@aira/rpc";
import type { IAiraAgentService } from "@aira/services";
import type { ProcessResourceRuntimeSurface } from "@aira/shared";
import { HostResponseTypes } from "@aira/shared";

interface RegisterHostMcpTelemetryOptions {
  agentService: Pick<IAiraAgentService, "onDynamicMcpTelemetry">;
  postMessage(message: unknown): void;
  runtimeSurface: ProcessResourceRuntimeSurface;
}

export function registerHostMcpTelemetry(options: RegisterHostMcpTelemetryOptions): IDisposable {
  return options.agentService.onDynamicMcpTelemetry()((event) => {
    try {
      options.postMessage({
        type: HostResponseTypes.McpTelemetry,
        runtimeSurface: options.runtimeSurface,
        event,
      });
    } catch {
      // main 已退出或 IPC 不可用时只丢当前遥测，不影响 MCP 生命周期。
    }
  });
}
