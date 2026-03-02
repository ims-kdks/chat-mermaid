import { describe, expect, it } from "vitest";
import plugin from "../src/index";

describe("plugin export", () => {
  it("exports a plugin hooks object", () => {
    expect(typeof plugin).toBe("object");
    expect(plugin).toHaveProperty("experimental.text.complete");
  });
});
