import type { Locale } from "@aira/shared";
import enUS from "./locales/en-US.js";

/**
 * 语言 → 翻译消息映射。IntlProvider 与 ErrorBoundary 共用这一份。
 * 日/俄/韩文案表可能缺 key（例如官方版本安全校验文案只有中英），缺失时先回退 en-US，
 * 避免界面直接露出 key；中文表是完整的，不需要合并。
 */
export const LOCALE_MESSAGES: Record<Locale, Record<string, string>> = {
  // Patch (Aira): English-only — every locale renders the en-US catalog.
  "zh-CN": enUS,
  "en-US": enUS,
  "ja-JP": enUS,
  "ru-RU": enUS,
  "ko-KR": enUS,
};
