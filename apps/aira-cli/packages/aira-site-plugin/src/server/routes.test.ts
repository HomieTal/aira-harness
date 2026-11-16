import { describe, expect, it } from "vitest";
import { resourcePath } from "./routes.ts";

const SITE = "1978123456789012480";
const DEP = "1978123456789012481";

describe("resourcePath", () => {
  it.each([
    ["aira-site://usage", "/api/v1/sites/usage"],
    ["aira-site://plans", "/api/v1/sites/plans"],
    ["aira-site://sites", "/api/v1/sites"],
    ["aira-site://sites?cursor=", "/api/v1/sites"],
    [
      "aira-site://sites?cursor=a%2Fb&limit=20",
      "/api/v1/sites?cursor=a%2Fb&limit=20",
    ],
    [`aira-site://sites/${SITE}`, `/api/v1/sites/${SITE}`],
    [
      `aira-site://sites/${SITE}/deployments?cursor=x`,
      `/api/v1/sites/${SITE}/deployments?cursor=x`,
    ],
    [
      `aira-site://sites/${SITE}/deployments/${DEP}`,
      `/api/v1/sites/${SITE}/deployments/${DEP}`,
    ],
    [`aira-site://sites/${SITE}/cover`, `/api/v1/sites/${SITE}/cover`],
    [`aira-site://sites/${SITE}/analytics`, `/api/v1/sites/${SITE}/analytics`],
    [
      `aira-site://sites/${SITE}/analytics?range=30d`,
      `/api/v1/sites/${SITE}/analytics?range=30d`,
    ],
    [
      `aira-site://sites/analytics/pv24h?siteIds=${SITE},${DEP}`,
      `/api/v1/sites/analytics/pv24h?siteIds=${SITE}%2C${DEP}`,
    ],
    [
      `aira-site://sites/${SITE}/deployments/${DEP}/logs?offset=12`,
      `/api/v1/sites/${SITE}/deployments/${DEP}/logs?offset=12`,
    ],
  ])("maps %s", (uri, path) => {
    expect(resourcePath(uri)).toBe(path);
  });

  it.each([
    "aira-site://other",
    "https://sites/1",
    "aira-site://usage?cursor=1",
    "aira-site://plans?limit=1",
    "aira-site://plans/free",
    "aira-site://sites/abc",
    "aira-site://sites/0123",
    "aira-site://sites/1/deployments/2/logs/extra",
    "aira-site://sites/1/cover/2",
    "aira-site://sites/1/cover?offset=1",
    "aira-site://sites/1/settings",
    "aira-site://sites/1/deployments/2/logs?offset=-1",
    "aira-site://sites?limit=1e3",
    "aira-site://sites?cursor=a&cursor=b",
    "aira-site://sites/1/deployments/2?offset=1",
    "aira-site://user@sites",
    "aira-site://sites/..%2Fusage",
    "aira-site://sites/1/analytics?range=1y",
    "aira-site://sites/1/analytics?offset=1",
    "aira-site://sites/1/analytics/pages",
    "aira-site://sites/analytics",
    "aira-site://sites/analytics/pv24h?siteIds=1,abc",
    `aira-site://sites/analytics/pv24h?siteIds=${Array(21).fill("1").join(",")}`,
    "aira-site://sites/analytics/pv24h?range=24h",
    "not a uri",
  ])("rejects %s", (uri) => {
    expect(resourcePath(uri)).toBeUndefined();
  });
});
