export type RenderResult =
  | { status: "success"; svg: string }
  | { status: "error"; warning: string };

export function createRenderCoordinator(renderFn: (code: string) => Promise<string>) {
  const cache = new Map<string, RenderResult>();

  return {
    async render(blockHash: string, code: string): Promise<RenderResult> {
      const cached = cache.get(blockHash);
      if (cached) {
        return cached;
      }

      try {
        const svg = await renderFn(code);
        const success: RenderResult = { status: "success", svg };
        cache.set(blockHash, success);
        return success;
      } catch {
        const error: RenderResult = {
          status: "error",
          warning: "Mermaid preview unavailable",
        };
        cache.set(blockHash, error);
        return error;
      }
    },
  };
}
