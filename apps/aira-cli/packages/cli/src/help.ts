import { getAiraCopy, type SupportedLocale, type UiLocale } from "@aira/i18n";

export function formatCliHelp(
  version: string,
  locale?: UiLocale,
  detectedLocale?: SupportedLocale,
): string {
  return getAiraCopy(locale, detectedLocale).cli.help(version);
}
