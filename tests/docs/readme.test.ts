import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README docs", () => {
  it("documents required preview behaviors", () => {
    const text = readFileSync("README.md", "utf8");

    expect(text).toContain("TUI auto-preview");
    expect(text).toContain("Web/Desktop toggle");
    expect(text).toContain("fallback raw block + warning");
  });
});
