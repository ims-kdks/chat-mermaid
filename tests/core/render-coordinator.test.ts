import { describe, expect, it, vi } from "vitest";
import { createRenderCoordinator } from "../../src/core/render-coordinator";

describe("createRenderCoordinator", () => {
  it("returns error fallback with warning when renderer throws", async () => {
    const coordinator = createRenderCoordinator(async () => {
      throw new Error("invalid mermaid");
    });

    const result = await coordinator.render("hash-1", "flowchart TD");

    expect(result.status).toBe("error");
    expect(result.warning).toContain("Mermaid preview unavailable");
  });

  it("caches results by blockHash", async () => {
    const renderFn = vi.fn(async (code: string) => `<svg>${code}</svg>`);
    const coordinator = createRenderCoordinator(renderFn);

    const first = await coordinator.render("hash-1", "flowchart TD");
    const second = await coordinator.render("hash-1", "flowchart LR");

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ status: "success", svg: "<svg>flowchart TD</svg>" });
    expect(second).toEqual(first);
  });
});
