import { recordArmsCustomEventForE2E } from "@aira/ui";
import { DesktopCommandIds, buildLocalMediaPreviewUrl, type IPlatformService } from "@aira/shared";

import { desktopBrowserPlatformBridge } from "./desktopBrowserPlatformBridge.js";

export function createDesktopPlatform(options: {
  isLocalDevelopmentRuntime: boolean;
}): IPlatformService {
  return {
    canSelectFilePath: true,
    createLocalMediaPreviewUrl: buildLocalMediaPreviewUrl,
    isLocalDevelopmentRuntime: options.isLocalDevelopmentRuntime,
    selectDirectory: () => window.aira.selectDirectory(),
    selectFile: () => window.aira.selectFile(),
    selectFiles: () => window.aira.selectFiles?.() ?? Promise.resolve([]),
    createTempTextAttachment: (payload) => window.aira.createTempTextAttachment(payload),
    onRemoteConnectionLog: (handler) => window.aira.onRemoteConnectionLog(handler),
    onRemoteSessionClosed: (handler) => window.aira.onRemoteSessionClosed(handler),
    onBotRemoteWorkspaceReconnected: (handler) =>
      window.aira.onBotRemoteWorkspaceReconnected(handler),
    activateOrSetWorkspace: (path) =>
      window.aira.activateOrSetWorkspace?.(path) ?? Promise.resolve({ activated: false }),
    connectRemote: (remoteOptions, requestId, context) =>
      window.aira.connectRemote(remoteOptions, requestId, context),
    cancelPendingRemoteConnection: (requestId) =>
      window.aira.cancelPendingRemoteConnection?.(requestId) ?? Promise.resolve(),
    bindRemoteWorkspaceSessionContext: (context) =>
      window.aira.bindRemoteWorkspaceSessionContext?.(context) ?? Promise.resolve(),
    disposeRemoteSession: (sessionId) => window.aira.disposeRemoteSession(sessionId),
    isDockerAvailable: () => window.aira.isDockerAvailable(),
    listWSLDistros: () => window.aira.listWSLDistros(),
    listDockerContainers: () => window.aira.listDockerContainers(),
    listSSHConfigAliases: () => window.aira.listSSHConfigAliases(),
    loadMcpFromUserDirectory: (payload) => window.aira.loadMcpFromUserDirectory(payload),
    saveMcpToUserDirectory: (payload) => window.aira.saveMcpToUserDirectory(payload),
    migrateLegacyCommonMcp: (payload) => window.aira.migrateLegacyCommonMcp(payload),
    openExternal: (url) => window.aira.openExternal(url),
    openFeedback: () => window.aira.executeDesktopCommand(DesktopCommandIds.OpenFeedback),
    openCommunity: () => window.aira.executeDesktopCommand(DesktopCommandIds.OpenCommunity),
    canOpenCommunity: (locale) => window.aira.canOpenCommunity(locale),
    openInFileManager: (path) => window.aira.openInFileManager(path),
    openExternalFile: (path) => window.aira.openExternalFile(path),
    openCuaPermissionOnboarding: window.aira.openCuaPermissionOnboarding
      ? (permissionOptions) =>
          window.aira.openCuaPermissionOnboarding?.(permissionOptions) ??
          Promise.resolve({ success: false, error: "not_supported" })
      : undefined,
    prepareCuaHelperPermissionDrag: window.aira.prepareCuaHelperPermissionDrag
      ? () =>
          window.aira.prepareCuaHelperPermissionDrag?.() ??
          Promise.resolve({ success: false, error: "not_supported" })
      : undefined,
    startCuaHelperPermissionDrag: window.aira.startCuaHelperPermissionDrag
      ? () => window.aira.startCuaHelperPermissionDrag?.()
      : undefined,
    registerOAuthState: (payload) => window.aira.registerOAuthState(payload),
    onOAuthCallback: (callback) => window.aira.onOAuthCallback(callback),
    onPaymentCallback: (callback) => window.aira.onPaymentCallback(callback),
    onShareImport: (callback) => window.aira.onShareImport?.(callback) ?? (() => {}),
    notifyRendererReady: () => window.aira.notifyRendererReady(),
    reportTelemetryEvent: (payload) => window.aira.reportTelemetryEvent(payload),
    reportArmsCustomEvent: (payload) => {
      recordArmsCustomEventForE2E(payload);
      return window.aira.reportArmsCustomEvent(payload);
    },
    getRendererActionTraceConfig: window.aira.getRendererActionTraceConfig
      ? () => window.aira.getRendererActionTraceConfig!()
      : undefined,
    onRendererActionTraceConfigChanged: window.aira.onRendererActionTraceConfigChanged
      ? (callback) => window.aira.onRendererActionTraceConfigChanged!(callback)
      : undefined,
    reportLocalTtftBatch: (batch) => window.aira.reportLocalTtftBatch(batch),
    reportRendererActionTraceBatch: window.aira.reportRendererActionTraceBatch
      ? (batch) => window.aira.reportRendererActionTraceBatch!(batch)
      : undefined,
    reportRendererHeapSample: window.aira.reportRendererHeapSample
      ? (sample) => window.aira.reportRendererHeapSample!(sample)
      : undefined,
    showTaskNotification: (payload) => window.aira.showTaskNotification(payload),
    syncWindowTabs: (paths) => window.aira.syncWindowTabs(paths),
    syncWindowUnreadCount: (count) => window.aira.syncWindowUnreadCount(count),
    syncActiveTaskSession: (sessionId) => window.aira.syncActiveTaskSession(sessionId),
    syncAppSettings: (patch) => window.aira.syncAppSettings?.(patch),
    setShortcutRecordingActive: (active) => window.aira.setShortcutRecordingActive?.(active),
    onFocusTab: (handler) => window.aira.onFocusTab(handler),
    onNewTab: (handler) => window.aira.onNewTab(handler),
    onCloseActiveContextRequest: (handler) =>
      window.aira.onCloseActiveContextRequest?.(handler) ?? (() => {}),
    onOpenBrowserUrl: (handler) => window.aira.onOpenBrowserUrl?.(handler) ?? (() => {}),
    onBrowserViewScreenshotSurfacePrepare: (handler) =>
      window.aira.onBrowserViewScreenshotSurfacePrepare?.(handler) ?? (() => {}),
    onBrowserViewScreenshotSurfaceRelease: (handler) =>
      window.aira.onBrowserViewScreenshotSurfaceRelease?.(handler) ?? (() => {}),
    browserViewScreenshotSurfaceReady: (payload) =>
      window.aira.browserViewScreenshotSurfaceReady?.(payload),
    ...desktopBrowserPlatformBridge,
    onNewTask: (handler) => window.aira.onNewTask(handler),
    onOpenWorkspace: (handler) => {
      // 开发态或升级后的旧窗口可能仍运行未暴露 onOpenWorkspace 的 preload，
      // renderer 直接调用会在启动时崩溃。这里和 activateOrSetWorkspace 一样做兼容兜底，
      // 缺少该 bridge 时只禁用原生菜单回调，不影响应用继续打开。
      return window.aira.onOpenWorkspace?.(handler) ?? (() => {});
    },
    onOpenWorkspacePath: (handler) => window.aira.onOpenWorkspacePath?.(handler) ?? (() => {}),
    onOpenFeedbackDialog: (handler) => window.aira.onOpenFeedbackDialog?.(handler) ?? (() => {}),
    onOpenTicketsPanel: (handler) => window.aira.onOpenTicketsPanel?.(handler) ?? (() => {}),
    onWindowFullscreenChanged: (handler) => window.aira.onWindowFullscreenChanged(handler),
    getDesktopWindowChromeState: window.aira.getDesktopWindowChromeState
      ? () => window.aira.getDesktopWindowChromeState!()
      : undefined,
    onDesktopWindowChromeStateChanged: window.aira.onDesktopWindowChromeStateChanged
      ? (handler) => window.aira.onDesktopWindowChromeStateChanged!(handler)
      : undefined,
    getWindowControlsOverlayMetrics: () => window.aira.getWindowControlsOverlayMetrics?.() ?? null,
    onWindowControlsOverlayChanged: (handler) =>
      window.aira.onWindowControlsOverlayChanged?.(handler) ?? (() => {}),
    getDesktopZoomLevel: () =>
      window.aira.getDesktopZoomLevel?.() ?? Promise.resolve({ zoomLevel: 0 }),
    onDesktopZoomLevelChanged: (handler) =>
      window.aira.onDesktopZoomLevelChanged?.(handler) ?? (() => {}),
    onTaskNotificationClick: (handler) => window.aira.onTaskNotificationClick(handler),
    exportLogs: () => window.aira.exportLogs(),
    captureWindowScreenshot: () =>
      window.aira.captureWindowScreenshot?.() ?? Promise.resolve(null),
    onUpdateReady: (callback) => window.aira.onUpdateReady(callback),
    onUpdateCheckResult: (callback) => window.aira.onUpdateCheckResult(callback),
    onUpdateStateChanged: (callback) => window.aira.onUpdateStateChanged?.(callback) ?? (() => {}),
    getUpdateState: () =>
      window.aira.getUpdateState?.() ?? Promise.resolve({ kind: "idle", enabled: true }),
    downloadUpdate: () => window.aira.downloadUpdate?.() ?? Promise.resolve(),
    cancelUpdateDownload: () => window.aira.cancelUpdateDownload?.() ?? Promise.resolve(),
    openUpdateStatusWindow: () => window.aira.openUpdateStatusWindow?.() ?? Promise.resolve(),
    getAutoUpdatePreferences: () =>
      window.aira.getAutoUpdatePreferences?.() ??
      Promise.resolve({ autoDownloadAndInstallUpdates: false }),
    setAutoDownloadAndInstallUpdates: (enabled) =>
      window.aira.setAutoDownloadAndInstallUpdates?.(enabled) ?? Promise.resolve(),
    getDesktopSessionActivity: () =>
      window.aira.getDesktopSessionActivity?.() ??
      Promise.resolve({ runningAgentSessionCount: 0 }),
    getAiraStdioTapDevState: () =>
      window.aira.getAiraStdioTapDevState?.() ??
      Promise.resolve({ enabled: false, visible: false, logDir: "", statePath: "" }),
    onSettingsChanged: (callback) => window.aira.onSettingsChanged?.(callback) ?? (() => {}),
    onApplicationLocaleChanged: (callback) =>
      window.aira.onApplicationLocaleChanged?.(callback) ?? (() => {}),
    onPostUpdateReleaseNotes: (callback) => window.aira.onPostUpdateReleaseNotes(callback),
    acknowledgePostUpdateReleaseNotes: (version) =>
      window.aira.acknowledgePostUpdateReleaseNotes(version),
    skipUpdateVersion: (version) => window.aira.skipUpdateVersion?.(version) ?? Promise.resolve(),
    quitAndInstallUpdate: () => window.aira.quitAndInstallUpdate(),
    getInstalledEditors: () => window.aira.getInstalledEditors(),
    getApplicationIcon: (bundleId) =>
      window.aira.getApplicationIcon?.(bundleId) ?? Promise.resolve(null),
    openInEditor: (editorId, path, editorOptions) =>
      window.aira.openInEditor(editorId, path, editorOptions),
    executeDesktopCommand: (command) => window.aira.executeDesktopCommand(command),
    setApplicationLocale: (locale) => window.aira.setApplicationLocale(locale),
    getSystemLocale: () =>
      window.aira.getSystemLocale?.() ??
      Promise.resolve(navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US"),
    setTitleBarTheme: (theme) => window.aira.setTitleBarTheme(theme),
    getDeviceId: () =>
      (window as Window & { __AIRA_DEVICE_ID__?: string }).__AIRA_DEVICE_ID__ ?? "",
  };
}
