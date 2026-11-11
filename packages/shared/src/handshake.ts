export interface HelloMessage {
  type: "aira-hello";
  version: string;
  platform: string;
  arch: string;
  pid: number;
}

export interface HelloAckMessage {
  type: "aira-hello-ack";
  version: string;
  clientId: string;
}
