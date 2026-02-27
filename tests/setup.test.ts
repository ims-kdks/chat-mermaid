import { describe, expect, it } from "vitest";
import plugin from "../src/index";

describe("plugin export", () => {
  it("exports a plugin object", () => {
    expect(plugin).toBeTruthy();
    expect(typeof plugin).toBe("object");
  });
});
