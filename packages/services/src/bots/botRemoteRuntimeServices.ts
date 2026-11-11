import {
  ChannelClient,
  MessagePortProtocol,
  ProxyChannel,
  type MessagePortLike,
  type MessagePortPayload,
} from "@aira/rpc";
import {
  IAiraTaskService,
  type IAiraTaskService as IAiraTaskServiceShape,
} from "#src/session/airaTaskService.js";
import {
  IAiraAgentService,
  type IAiraAgentService as IAiraAgentServiceShape,
} from "#src/aira-agent/airaAgent.js";
import {
  IAiraSessionService,
  type IAiraSessionService as IAiraSessionServiceShape,
} from "#src/aira-session/airaSession.js";
import {
  IModelSelectionService,
  type IModelSelectionService as IModelSelectionServiceShape,
} from "#src/model-provider/providerFacadeServices.js";

interface PortLike {
  on?(event: "message", listener: (event: { data: MessagePortPayload }) => void): void;
  off?(event: "message", listener: (event: { data: MessagePortPayload }) => void): void;
  addEventListener?(
    event: "message",
    listener: (event: { data: MessagePortPayload }) => void,
  ): void;
  removeEventListener?(
    event: "message",
    listener: (event: { data: MessagePortPayload }) => void,
  ): void;
  postMessage(message: MessagePortPayload): void;
  start?(): void;
  close?(): void;
}

function toMessagePortLike(port: PortLike): MessagePortLike {
  return {
    addEventListener(type, listener) {
      if (port.addEventListener) {
        port.addEventListener(type, listener);
        return;
      }
      port.on?.(type, listener);
    },
    removeEventListener(type, listener) {
      if (port.removeEventListener) {
        port.removeEventListener(type, listener);
        return;
      }
      port.off?.(type, listener);
    },
    postMessage(data) {
      port.postMessage(data);
    },
    start() {
      port.start?.();
    },
    close() {
      port.close?.();
    },
  };
}

export interface RemoteBotWorkspaceRuntimeServices {
  airaAgentService: IAiraAgentServiceShape;
  airaTaskService: IAiraTaskServiceShape;
  airaSessionService: IAiraSessionServiceShape;
  modelSelectionService: IModelSelectionServiceShape;
}

export function createRemoteRuntimeServicesFromPort(
  port: unknown,
): RemoteBotWorkspaceRuntimeServices {
  const protocol = new MessagePortProtocol(toMessagePortLike(port as PortLike));
  const client = new ChannelClient(protocol);
  return {
    airaAgentService: ProxyChannel.toService<IAiraAgentServiceShape>(
      client.getChannel(IAiraAgentService.channelName),
    ),
    airaTaskService: ProxyChannel.toService<IAiraTaskServiceShape>(
      client.getChannel(IAiraTaskService.channelName),
    ),
    airaSessionService: ProxyChannel.toService<IAiraSessionServiceShape>(
      client.getChannel(IAiraSessionService.channelName),
    ),
    modelSelectionService: ProxyChannel.toService<IModelSelectionServiceShape>(
      client.getChannel(IModelSelectionService.channelName),
    ),
  };
}
