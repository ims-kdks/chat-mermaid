import { describe, expect, it } from "vitest";
import pluginFn from "../src/index";

describe("plugin export", () => {
  it("exports a plugin function", async () => {
    const plugin = await pluginFn();
    expect(typeof plugin).toBe("object");
    expect(plugin).toHaveProperty("experimental.text.complete");
  });
});
