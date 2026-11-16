import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { AiraStdioTapDevState } from "@aira/shared";
import { getAppConfigDir } from "#src/paths.js";
import { isEffectiveDevelopmentNodeEnv } from "#src/runtime-tools/nodeEnv.js";

interface AiraStdioTapStateFile {
  enabled?: boolean;
}

export function isAiraStdioTapDevVisible(): boolean {
  return isEffectiveDevelopmentNodeEnv();
}

export function getAiraStdioTapDevDir(): string {
  return join(getAppConfigDir(), "dev");
}

export function getAiraStdioTapDevLogDir(): string {
  return join(getAiraStdioTapDevDir(), "stdio-traffic");
}

export function getAiraStdioTapDevStatePath(): string {
  return join(getAiraStdioTapDevDir(), "aira-stdio-tap.json");
}

function readStateFile(path: string): AiraStdioTapStateFile {
  if (!existsSync(path)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as AiraStdioTapStateFile) : {};
  } catch {
    return {};
  }
}

export function readAiraStdioTapDevState(): AiraStdioTapDevState {
  const visible = isAiraStdioTapDevVisible();
  const statePath = getAiraStdioTapDevStatePath();
  const fileState = readStateFile(statePath);
  return {
    enabled: visible && fileState.enabled === true,
    visible,
    logDir: getAiraStdioTapDevLogDir(),
    statePath,
  };
}

export function setAiraStdioTapDevEnabled(enabled: boolean): AiraStdioTapDevState {
  const visible = isAiraStdioTapDevVisible();
  const statePath = getAiraStdioTapDevStatePath();
  mkdirSync(getAiraStdioTapDevDir(), { recursive: true });
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        // 开发态 stdio 抓包是高频原始协议帧，只能通过显式开关写旁路文件，避免误进生产日志。
        enabled: visible && enabled,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  return readAiraStdioTapDevState();
}
