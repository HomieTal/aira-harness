import type { ConfigResult } from "@aira/adapters/config";

export function getLocaleConfigPath(configResult: ConfigResult): string {
  const project = configResult.sources.project;
  if (project.loaded && project.hasUiLocale && project.uiLocalePath) {
    return project.uiLocalePath;
  }

  return configResult.sources.user.path;
}
