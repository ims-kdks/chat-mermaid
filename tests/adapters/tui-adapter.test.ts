import { describe, expect, it } from "vitest";
import { handleTuiPreview } from "../../src/adapters/tui-adapter";

describe("handleTuiPreview", () => {
  it("falls back to raw block when terminal image is unsupported", async () => {
    const output = await handleTuiPreview({
      terminalImageSupported: false,
      renderResult: { status: "success", svg: "<svg/>" },
      raw: "graph TD;A-->B",
    });

    expect(output).toEqual({
      mode: "fallback",
      raw: "graph TD;A-->B",
      warning: "Mermaid preview unavailable",
    });
  });

  it("renders svg when terminal is supported and render succeeds", async () => {
    const output = await handleTuiPreview({
      terminalImageSupported: true,
      renderResult: { status: "success", svg: "<svg>graph TD;A-->B</svg>" },
      raw: "graph TD;A-->B",
    });

    expect(output).toEqual({
      mode: "svg",
      svg: "<svg>graph TD;A-->B</svg>",
    });
  });

  it("falls back to raw block when render fails", async () => {
    const output = await handleTuiPreview({
      terminalImageSupported: true,
      renderResult: { status: "error", warning: "Mermaid preview unavailable" },
      raw: "graph TD;A-->B",
    });

    expect(output).toEqual({
      mode: "fallback",
      raw: "graph TD;A-->B",
      warning: "Mermaid preview unavailable",
    });
  });
});
