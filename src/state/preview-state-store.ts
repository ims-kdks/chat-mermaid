export type PreviewState = "closed" | "open";

export function createPreviewStateStore() {
  const stateByKey = new Map<string, PreviewState>();

  return {
    get(key: string): PreviewState {
      return stateByKey.get(key) ?? "closed";
    },
    toggle(key: string): PreviewState {
      const nextState: PreviewState = (stateByKey.get(key) ?? "closed") === "closed" ? "open" : "closed";
      stateByKey.set(key, nextState);
      return nextState;
    },
  };
}
