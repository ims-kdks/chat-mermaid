export type RenderResult =
  | { status: "success"; svg: string }
  | { status: "error"; warning: string };

export function createRenderCoordinator(renderFn: (code: string) => Promise<string>) {
  const cache = new Map<string, RenderResult>();
  const inFlight = new Map<string, Promise<RenderResult>>();

  return {
    async render(blockHash: string, code: string): Promise<RenderResult> {
      const cached = cache.get(blockHash);
      if (cached) {
        return cached;
      }

      const pending = inFlight.get(blockHash);
      if (pending) {
        return pending;
      }

      const renderPromise = (async () => {
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
        } finally {
          inFlight.delete(blockHash);
        }
      })();

      inFlight.set(blockHash, renderPromise);
      return renderPromise;
    },
  };
}
