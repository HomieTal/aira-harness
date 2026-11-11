const AIRA_PROCESS_PREFIX = "aira";
const MAX_PROCESS_NAME_SEGMENT_LENGTH = 24;

function sanitizeProcessNameSegment(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, MAX_PROCESS_NAME_SEGMENT_LENGTH);
}

function joinAiraProcessName(...segments: Array<string | null | undefined>): string {
  const sanitizedSegments = segments
    .map((segment) => sanitizeProcessNameSegment(segment))
    .filter((segment): segment is string => Boolean(segment));
  return [AIRA_PROCESS_PREFIX, ...sanitizedSegments].join("-");
}

function pickWorkspaceTag(workspacePath: string | null | undefined): string | undefined {
  const trimmedPath = workspacePath?.trim();
  if (!trimmedPath) {
    return undefined;
  }

  const parts = trimmedPath.split(/[\\/]+/).filter(Boolean);
  return parts.at(-1) ?? trimmedPath;
}

export function formatAiraMainProcessName(): string {
  return joinAiraProcessName("main");
}

export function formatAiraGpuProcessName(): string {
  return joinAiraProcessName("gpu");
}

export function formatAiraHostProcessName(label?: string): string {
  return joinAiraProcessName("host", label);
}

export function formatAiraRendererProcessName(windowTitle?: string): string {
  const normalizedTitle = windowTitle?.trim();
  if (!normalizedTitle || normalizedTitle === "Aira") {
    return joinAiraProcessName("renderer", "main");
  }

  if (normalizedTitle === "Resource Manager") {
    return joinAiraProcessName("renderer", "resource-manager");
  }

  const remoteWindowPrefix = "Aira - ";
  if (normalizedTitle.startsWith(remoteWindowPrefix)) {
    return joinAiraProcessName(
      "renderer",
      "remote",
      normalizedTitle.slice(remoteWindowPrefix.length),
    );
  }

  return joinAiraProcessName("renderer", normalizedTitle);
}

export function formatAiraAgentProcessName(provider: string, workspacePath?: string): string {
  return joinAiraProcessName("agent", provider, pickWorkspaceTag(workspacePath));
}

export function formatAiraUtilityProcessName(name?: string, type = "utility"): string {
  return joinAiraProcessName(type, name);
}
