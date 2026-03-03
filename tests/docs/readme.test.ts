import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README docs", () => {
  const text = readFileSync("README.md", "utf8");

  it("documents installation via opencode config", () => {
    expect(text).toContain("Install");
    expect(text).toContain("plugins:");
    expect(text).toContain("chat-mermaid@latest");
  });

  it("documents usage", () => {
    expect(text).toContain("Usage");
  });

  it("documents limitations", () => {
    expect(text).toContain("Limitations");
  });

  it("documents contribution guidelines", () => {
    expect(text).toContain("Contributing");
    expect(text).toMatch(/contributions are welcome/i);
  });
});
