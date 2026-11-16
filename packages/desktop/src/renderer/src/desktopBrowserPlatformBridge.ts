import type { IPlatformService } from "@aira/shared";

type DesktopBrowserPlatformBridge = Pick<
  IPlatformService,
  | "onBrowserViewDownloadStarted"
  | "onBrowserViewReady"
  | "onBrowserViewOperation"
  | "onBrowserViewViewportChanged"
  | "onBrowserViewVisibility"
  | "onBrowserViewCloseTab"
  | "onBrowserViewSuspend"
  | "onBrowserViewRestore"
  | "browserViewLoadUrl"
  | "browserViewAttachGuest"
  | "browserViewDetachGuest"
  | "browserViewCloseTab"
  | "browserViewReportResidency"
  | "browserViewPromoteDraftTabs"
  | "browserViewSuspendReady"
  | "browserViewEnsureResident"
  | "browserViewRestoreTabs"
  | "browserViewUpdateViewport"
  | "importChromeBrowserData"
  | "clearEmbeddedBrowserData"
  | "getPathForFile"
  | "saveFile"
  | "printPageToPdf"
  | "microphone"
  | "captureBrowserGuestPage"
>;

// Rebase 集成：browser bridge 若继续内联在 renderer 入口，会让入口越过 max-lines 门禁。
// 独立对象只做 preload 委托与旧 bridge 兼容兜底，不持有 Browser 业务状态。
export const desktopBrowserPlatformBridge = {
  getPathForFile: (file) => window.aira.getPathForFile?.(file) ?? null,
  saveFile: (payload) =>
    window.aira.saveFile?.(payload) ?? Promise.resolve({ success: false, error: "not_supported" }),
  // 条件定义而非兜底返回失败：UI 靠方法是否存在做能力检测，旧 preload 下必须保持 undefined
  printPageToPdf: window.aira.printPageToPdf ? () => window.aira.printPageToPdf!() : undefined,
  // 与 printPageToPdf 一样按 preload 是否提供决定能力是否存在，UI 据此决定是否显示语音输入。
  microphone:
    window.aira.ensureMicrophoneAccess &&
    window.aira.resetMicrophoneAccess &&
    window.aira.openMicrophoneSettings
      ? {
          ensureAccess: () => window.aira.ensureMicrophoneAccess!(),
          resetAccess: () => window.aira.resetMicrophoneAccess!(),
          openSettings: (target) => window.aira.openMicrophoneSettings!(target),
        }
      : undefined,
  onBrowserViewDownloadStarted: (handler) =>
    window.aira.onBrowserViewDownloadStarted?.(handler) ?? (() => {}),
  captureBrowserGuestPage: window.aira.captureBrowserGuestPage
    ? (payload) => window.aira.captureBrowserGuestPage!(payload)
    : undefined,
  onBrowserViewReady: (handler) => window.aira.onBrowserViewReady?.(handler) ?? (() => {}),
  onBrowserViewOperation: (handler) => window.aira.onBrowserViewOperation?.(handler) ?? (() => {}),
  onBrowserViewViewportChanged: (handler) =>
    window.aira.onBrowserViewViewportChanged?.(handler) ?? (() => {}),
  onBrowserViewVisibility: (handler) =>
    window.aira.onBrowserViewVisibility?.(handler) ?? (() => {}),
  onBrowserViewCloseTab: (handler) => window.aira.onBrowserViewCloseTab?.(handler) ?? (() => {}),
  onBrowserViewSuspend: (handler) => window.aira.onBrowserViewSuspend?.(handler) ?? (() => {}),
  onBrowserViewRestore: (handler) => window.aira.onBrowserViewRestore?.(handler) ?? (() => {}),
  browserViewLoadUrl: (payload) => window.aira.browserViewLoadUrl!(payload),
  browserViewAttachGuest: (payload) =>
    window.aira.browserViewAttachGuest?.(payload) ??
    Promise.resolve({ ok: false, reason: "not-found", recoveryRequested: false }),
  browserViewDetachGuest: (payload) =>
    window.aira.browserViewDetachGuest?.(payload) ?? Promise.resolve(false),
  browserViewCloseTab: (payload) =>
    window.aira.browserViewCloseTab?.(payload) ?? Promise.resolve(),
  browserViewReportResidency: (payload) =>
    window.aira.browserViewReportResidency?.(payload) ?? Promise.resolve(),
  browserViewPromoteDraftTabs: (payload) =>
    window.aira.browserViewPromoteDraftTabs?.(payload) ?? Promise.resolve([]),
  browserViewSuspendReady: (payload) =>
    window.aira.browserViewSuspendReady?.(payload) ?? Promise.resolve(),
  browserViewEnsureResident: (payload) =>
    window.aira.browserViewEnsureResident?.(payload) ?? Promise.resolve(),
  browserViewRestoreTabs: (payload) =>
    window.aira.browserViewRestoreTabs?.(payload) ?? Promise.resolve([]),
  browserViewUpdateViewport: (payload) =>
    window.aira.browserViewUpdateViewport?.(payload) ?? Promise.resolve(),
  importChromeBrowserData: (options) =>
    window.aira.importChromeBrowserData?.(options) ??
    Promise.resolve({
      success: false,
      cookies: { imported: 0, skipped: 0, failed: 0 },
      localStorage: {
        originsImported: 0,
        entriesImported: 0,
        originsSkipped: 0,
        originsFailed: 0,
      },
      error: "unsupported",
    }),
  clearEmbeddedBrowserData: (mode) =>
    window.aira.clearEmbeddedBrowserData?.(mode) ??
    Promise.resolve({ success: false, error: "unsupported" }),
} satisfies DesktopBrowserPlatformBridge;
