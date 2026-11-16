import type { AiraBackgroundTaskControlItem } from "./background-task-controls.js";

export function mergeAiraBackgroundTaskControlItems(
  current: readonly AiraBackgroundTaskControlItem[],
  updates: readonly AiraBackgroundTaskControlItem[],
): AiraBackgroundTaskControlItem[] {
  const jobsById = new Map(current.map((job) => [job.jobId, job] as const));
  for (const job of updates) {
    jobsById.set(job.jobId, job);
  }
  return Array.from(jobsById.values());
}
