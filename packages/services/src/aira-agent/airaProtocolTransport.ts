import type { Event, IDisposable } from "@aira/rpc";
import type { AiraProtocolMessage } from "@aira/shared";

export type AiraProtocolTransportKind = "stdio" | "websocket" | "memory";

export interface AiraProtocolTransportClosedEvent {
  code?: number | null;
  signal?: NodeJS.Signals | null;
  reason?: string;
}

export interface AiraProtocolTransport extends IDisposable {
  readonly kind: AiraProtocolTransportKind;
  readonly onMessage: Event<AiraProtocolMessage>;
  readonly onClose: Event<AiraProtocolTransportClosedEvent>;
  send(message: AiraProtocolMessage): Promise<void>;
  disposeAndWait?(options?: { deadlineAtMs?: number }): Promise<void>;
}
