import type { UiLocale, SupportedLocale } from "@aira/contracts";
import { enUS } from "./locales/en-US.js";
// Patch (Aira): English-only — the zh-CN catalog is no longer bundled.
// import { zhCN } from "./locales/zh-CN.js";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isSupportedLocale,
  isUiLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "./locale.js";
import type { AiraCopy } from "./types.js";

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocale,
  isSupportedLocale,
  isUiLocale,
  resolveLocale,
};
export type { LocaleDetectionInput } from "./locale.js";
export type { CliCopy, TuiCopy, UiLocale, SupportedLocale, AiraCopy } from "./types.js";

const CATALOGS: Record<SupportedLocale, AiraCopy> = {
  "en-US": enUS,
  // Patch (Aira): English-only.
  "zh-CN": enUS,
};

export function getAiraCopy(locale?: UiLocale | string, detected?: string | null): AiraCopy {
  return CATALOGS[resolveLocale(locale, detected)];
}
