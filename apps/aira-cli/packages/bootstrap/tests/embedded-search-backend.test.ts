import { describe, expect, it } from "vitest";
import { resolveDefaultEmbeddedSearchBackend } from "../src/app/embedded-search-backend.js";

describe("resolveDefaultEmbeddedSearchBackend", () => {
  it("uses bundled bfs, ugrep, and ripgrep paths by default", () => {
    expect(
      resolveDefaultEmbeddedSearchBackend({
        env: {
          AIRA_BFS_BINARY: "/opt/aira/tools/bfs/bfs",
          AIRA_RG_BINARY: "/opt/aira/tools/ripgrep/rg",
          AIRA_UGREP_BINARY: "/opt/aira/tools/ugrep/ugrep",
        },
      }),
    ).toEqual({
      kind: "native-binaries",
      findCommand: "/opt/aira/tools/bfs/bfs",
      grepCommand: "/opt/aira/tools/ugrep/ugrep",
      rgCommand: "/opt/aira/tools/ripgrep/rg",
    });
  });

  it("falls back to bfs, ugrep, and rg command names when bundled paths are unavailable", () => {
    expect(resolveDefaultEmbeddedSearchBackend({ env: {} })).toEqual({
      kind: "native-binaries",
      findCommand: "bfs",
      grepCommand: "ugrep",
      rgCommand: "rg",
    });
  });

  it("preserves the explicit internal CLI compatibility override", () => {
    expect(
      resolveDefaultEmbeddedSearchBackend({
        env: { AIRA_EMBEDDED_SEARCH_COMMAND: "/tmp/aira-test" },
      }),
    ).toEqual({
      kind: "internal-cli",
      command: "/tmp/aira-test",
      args: ["__internal-search"],
    });
  });
});
