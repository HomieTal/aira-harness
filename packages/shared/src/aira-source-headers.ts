import { DEFAULT_AIRA_ENDPOINT_ORIGIN } from "./airaEndpoint.js";

export const AIRA_SOURCE_HEADERS = {
  "User-Agent": "Aira/unknown",
  "HTTP-Referer": DEFAULT_AIRA_ENDPOINT_ORIGIN,
  "X-Title": "Z Code@electron",
} as const;

export interface BuildAiraSourceHeadersFromContextOptions {
  appVersion?: string;
  arch?: string;
  clientLanguage?: string;
  clientTimezone?: string;
  deviceMid?: string;
  endpointOrigin?: string;
  osVersion?: string;
  platform?: string;
  releaseChannel?: string;
  sourceTitle?: string;
}

export function normalizeAiraSourceHeaderValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !/^[\x20-\x7e]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function buildAiraSourceHeadersFromContext(
  options: BuildAiraSourceHeadersFromContextOptions = {},
): Record<string, string> {
  const appVersion = normalizeAiraSourceHeaderValue(options.appVersion);
  const arch = normalizeAiraSourceHeaderValue(options.arch);
  const clientLanguage = normalizeAiraSourceHeaderValue(options.clientLanguage) ?? "unknown";
  const clientTimezone = normalizeAiraSourceHeaderValue(options.clientTimezone) ?? "unknown";
  const deviceMid = normalizeAiraSourceHeaderValue(options.deviceMid);
  const endpointOrigin =
    normalizeAiraSourceHeaderValue(options.endpointOrigin) ?? DEFAULT_AIRA_ENDPOINT_ORIGIN;
  const osVersion = normalizeAiraSourceHeaderValue(options.osVersion);
  const platform = normalizeAiraSourceHeaderValue(options.platform);
  const releaseChannel = normalizeAiraSourceHeaderValue(options.releaseChannel);
  const sourceTitle = normalizeAiraSourceHeaderValue(options.sourceTitle) ?? "electron";

  return {
    ...AIRA_SOURCE_HEADERS,
    "HTTP-Referer": endpointOrigin,
    "User-Agent": `Aira/${appVersion ?? "unknown"}`,
    ...(appVersion ? { "X-Aira-App-Version": appVersion } : {}),
    "X-Title": `Z Code@${sourceTitle}`,
    ...(platform && arch ? { "X-Platform": `${platform}-${arch}` } : {}),
    ...(releaseChannel ? { "X-Release-Channel": releaseChannel } : {}),
    "X-Client-Language": clientLanguage,
    "X-Client-Timezone": clientTimezone,
    ...(platform ? { "X-Os-Category": normalizeOsCategory(platform) } : {}),
    ...(osVersion ? { "X-Os-Version": osVersion } : {}),
    ...(deviceMid ? { "X-Device-Mid": deviceMid } : {}),
  };
}

function normalizeOsCategory(platform: string): string {
  switch (platform) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}
