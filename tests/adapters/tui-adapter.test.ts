import { describe, expect, it } from "vitest";
import { handleTuiPreview } from "../../src/adapters/tui-adapter";

describe("handleTuiPreview", () => {
  it("falls back to raw block when terminal image is unsupported", async () => {
    const output = await handleTuiPreview({
      terminalImageSupported: false,
      svg: "<svg/>",
      raw: "graph TD;A-->B",
    });

    expect(output).toEqual({
      mode: "fallback",
      raw: "graph TD;A-->B",
      warning: "Mermaid preview unavailable",
    });
  });
});
