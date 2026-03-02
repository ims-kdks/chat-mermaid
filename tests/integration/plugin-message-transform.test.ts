import { beforeEach, describe, expect, it, vi } from "vitest";

const rendererState = vi.hoisted(() => ({
  mode: "success" as "success" | "render-fail" | "import-fail",
}));

vi.mock("beautiful-mermaid", () => {
  if (rendererState.mode === "import-fail") {
    throw new Error("renderer import failed");
  }

  return {
    renderMermaidSVG: (code: string) => {
      if (rendererState.mode !== "success") {
        throw new Error("renderer failed");
      }
      return `<svg>${code}</svg>`;
    },
    renderMermaid: (code: string) => {
      if (rendererState.mode !== "success") {
        throw new Error("renderer failed");
      }
      return `<svg>${code}</svg>`;
    },
  };
});

describe("plugin text complete integration", () => {
  beforeEach(() => {
    vi.resetModules();
    rendererState.mode = "success";
  });

  it("exposes experimental text complete hook", async () => {
    const { default: plugin } = await import("../../src/index");
    expect(plugin).toHaveProperty("experimental.text.complete");
    expect(typeof plugin["experimental.text.complete"]).toBe("function");
  });

  it("replaces mermaid fenced blocks with image markdown", async () => {
    const { default: plugin } = await import("../../src/index");
    const output = {
      text: "Before\n```mermaid\ngraph TD\nA-->B\n```\nAfter",
    };

    await plugin["experimental.text.complete"](
      {
        sessionID: "s1",
        messageID: "m1",
        partID: "p1",
      },
      output,
    );

    expect(output.text).toContain("Before");
    expect(output.text).toContain("After");
    expect(output.text).toContain("![Mermaid diagram](data:image/svg+xml;utf8,");
    expect(output.text).not.toContain("```mermaid");
  });

  it("keeps raw mermaid block and adds warning when renderer import fails", async () => {
    rendererState.mode = "import-fail";
    const { default: plugin } = await import("../../src/index");
    const output = {
      text: "```mermaid\nflowchart TD\nA-->B\n```",
    };

    await plugin["experimental.text.complete"](
      {
        sessionID: "s1",
        messageID: "m1",
        partID: "p1",
      },
      output,
    );

    expect(output.text).toContain("```mermaid");
    expect(output.text).toContain("flowchart TD");
    expect(output.text).toContain("Mermaid preview unavailable");
  });

  it("leaves text unchanged when no mermaid block is present", async () => {
    const { default: plugin } = await import("../../src/index");
    const original = "No diagram here.";
    const output = { text: original };

    await plugin["experimental.text.complete"](
      {
        sessionID: "s1",
        messageID: "m1",
        partID: "p1",
      },
      output,
    );

    expect(output.text).toBe(original);
  });
});
