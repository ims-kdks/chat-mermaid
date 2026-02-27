import { describe, expect, it } from "vitest";
import { detectMermaidBlocks } from "../../src/core/detect-mermaid-blocks";

describe("detectMermaidBlocks", () => {
  it("returns empty array when no mermaid fence exists", () => {
    const blocks = detectMermaidBlocks("m1", "p1", "plain text only");

    expect(blocks).toEqual([]);
  });

  it("extracts fenced mermaid blocks from model text", () => {
    const input = "text\n```mermaid\nflowchart TD\nA-->B\n```\nmore";
    const blocks = detectMermaidBlocks("m1", "p1", input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toContain("flowchart TD");
  });

  it("extracts multiple mermaid blocks with sequential indices", () => {
    const input = "```mermaid\nflowchart TD\nA-->B\n```\ntext\n```mermaid\nsequenceDiagram\nA->>B: hi\n```";
    const blocks = detectMermaidBlocks("m1", "p1", input);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].blockIndex).toBe(0);
    expect(blocks[1].blockIndex).toBe(1);
  });

  it("supports CRLF line endings", () => {
    const input = "text\r\n```mermaid\r\nflowchart TD\r\nA-->B\r\n```\r\n";
    const blocks = detectMermaidBlocks("m1", "p1", input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toContain("flowchart TD");
  });

  it("supports trailing spaces in mermaid fence header", () => {
    const input = "```mermaid   \nflowchart TD\nA-->B\n```";
    const blocks = detectMermaidBlocks("m1", "p1", input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toContain("flowchart TD");
  });

  it("builds stable and unique blockHash values", () => {
    const input = "```mermaid\nA-->B\n```\n```mermaid\nA-->C\n```";

    const firstRun = detectMermaidBlocks("m1", "p1", input);
    const secondRun = detectMermaidBlocks("m1", "p1", input);

    expect(firstRun[0].blockHash).toBe("m1:p1:0:A-->B");
    expect(firstRun[1].blockHash).toBe("m1:p1:1:A-->C");
    expect(firstRun[0].blockHash).not.toBe(firstRun[1].blockHash);
    expect(secondRun.map((block) => block.blockHash)).toEqual(firstRun.map((block) => block.blockHash));
  });
});
