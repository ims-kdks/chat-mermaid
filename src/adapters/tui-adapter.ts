import type { RenderResult } from "../core/render-coordinator";

type TuiPreviewInput = {
  terminalImageSupported: boolean;
  renderResult: RenderResult;
  raw: string;
};

type TuiPreviewOutput =
  | { mode: "fallback"; raw: string; warning: "Mermaid preview unavailable" }
  | { mode: "svg"; svg: string };

export async function handleTuiPreview(input: TuiPreviewInput): Promise<TuiPreviewOutput> {
  const warning =
    input.renderResult.status === "error"
      ? input.renderResult.warning
      : "Mermaid preview unavailable";

  if (!input.terminalImageSupported || input.renderResult.status === "error") {
    return {
      mode: "fallback",
      raw: input.raw,
      warning,
    };
  }

  return {
    mode: "svg",
    svg: input.renderResult.svg,
  };
}
