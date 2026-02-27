import { describe, expect, it } from "vitest";
import { detectMermaidBlocks } from "../../src/core/detect-mermaid-blocks";

describe("detectMermaidBlocks", () => {
  it("extracts fenced mermaid blocks from model text", () => {
    const input = "text\n```mermaid\nflowchart TD\nA-->B\n```\nmore";
    const blocks = detectMermaidBlocks("m1", "p1", input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toContain("flowchart TD");
  });
});
