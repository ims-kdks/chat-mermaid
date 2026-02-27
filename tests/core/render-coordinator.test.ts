import { describe, expect, it, vi } from "vitest";
import { createRenderCoordinator } from "../../src/core/render-coordinator";

describe("createRenderCoordinator", () => {
  it("returns error fallback with warning when renderer throws", async () => {
    const coordinator = createRenderCoordinator(async () => {
      throw new Error("invalid mermaid");
    });

    const result = await coordinator.render("hash-1", "flowchart TD");

    expect(result.status).toBe("error");
    if (result.status !== "error") {
      throw new Error("expected error result");
    }
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

  it("deduplicates in-flight renders for the same blockHash", async () => {
    let resolveRender: ((value: string) => void) | undefined;
    const renderFn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRender = resolve;
        }),
    );
    const coordinator = createRenderCoordinator(renderFn);

    const firstPromise = coordinator.render("hash-1", "flowchart TD");
    const secondPromise = coordinator.render("hash-1", "flowchart TD");

    expect(renderFn).toHaveBeenCalledTimes(1);

    resolveRender?.("<svg>flowchart TD</svg>");

    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    expect(first).toEqual({ status: "success", svg: "<svg>flowchart TD</svg>" });
    expect(second).toEqual(first);
  });

  it("caches fallback after renderer throws", async () => {
    const renderFn = vi.fn(async () => {
      throw new Error("invalid mermaid");
    });
    const coordinator = createRenderCoordinator(renderFn);

    const first = await coordinator.render("hash-throw", "flowchart TD");
    const second = await coordinator.render("hash-throw", "flowchart TD");

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ status: "error", warning: "Mermaid preview unavailable" });
    expect(second).toEqual(first);
  });
});
