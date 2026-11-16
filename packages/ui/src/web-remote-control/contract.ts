import type { IOAuthService } from "@aira/services";
import type { IPlatformService } from "@aira/shared";
import type { WebRemoteControlWorkspaceSwitcherApi } from "@/root/types.js";

export type WebRemoteControlDeviceNavigation = NonNullable<
  WebRemoteControlWorkspaceSwitcherApi["deviceNavigation"]
>;
export type WebRemoteControlAuthPlatform = Pick<
  IPlatformService,
  "notifyWebRemoteControlAuthStateChanged"
>;
export type WebRemoteControlAuthEvents = Pick<IOAuthService, "onDidChangeSession">;
export type { WebRemoteControlMobileTaskView } from "@aira/shared";
export type WebRemoteControlTaskViewSwitcher = Pick<
  WebRemoteControlWorkspaceSwitcherApi,
  "updateMobileTaskView" | "updateMobileViewState"
>;
