import { describe, expect, it } from "vitest";
import plugin from "../src/index";

describe("plugin export", () => {
  it("exports a plugin object", () => {
    expect(typeof plugin).toBe("object");
    expect(plugin).toHaveProperty("name", "mermaid-preview");
  });
});
