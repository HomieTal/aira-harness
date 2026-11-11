import {
  collectVisibleAiraBackgroundTaskControlItems,
  getAiraBackgroundTaskControlItemElapsedMs,
  isActiveAiraBackgroundTaskControlItem,
  parseAiraBackgroundTaskControlItems,
  type AiraBackgroundTaskControlItem,
  type AiraBackgroundTaskControlStatus,
} from "./background-task-controls.js";

export type AiraBackgroundBashJobStatus = AiraBackgroundTaskControlStatus;
export type AiraBackgroundBashJob = AiraBackgroundTaskControlItem & {
  taskKind: "bash";
};

export function parseAiraBackgroundBashJobs(value: unknown): AiraBackgroundBashJob[] {
  return parseAiraBackgroundTaskControlItems(value).filter(isBackgroundBashJob);
}

export function isActiveAiraBackgroundBashJob(job: AiraBackgroundBashJob): boolean {
  return isActiveAiraBackgroundTaskControlItem(job);
}

export function getAiraBackgroundBashJobElapsedMs(
  job: AiraBackgroundBashJob,
  now = Date.now(),
): number {
  return getAiraBackgroundTaskControlItemElapsedMs(job, now);
}

export function collectVisibleAiraBackgroundBashJobs(
  jobs: readonly AiraBackgroundBashJob[],
  now = Date.now(),
  thresholdMs = 30_000,
): Array<AiraBackgroundBashJob & { elapsedMs: number }> {
  return collectVisibleAiraBackgroundTaskControlItems(jobs, now, thresholdMs) as Array<
    AiraBackgroundBashJob & { elapsedMs: number }
  >;
}

function isBackgroundBashJob(job: AiraBackgroundTaskControlItem): job is AiraBackgroundBashJob {
  return job.taskKind === "bash";
}
