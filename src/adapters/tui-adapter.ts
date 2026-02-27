type TuiPreviewInput = {
  terminalImageSupported: boolean;
  svg: string;
  raw: string;
};

type TuiPreviewOutput =
  | { mode: "fallback"; raw: string; warning: "Mermaid preview unavailable" }
  | { mode: "svg"; svg: string };

export async function handleTuiPreview(input: TuiPreviewInput): Promise<TuiPreviewOutput> {
  if (!input.terminalImageSupported) {
    return {
      mode: "fallback",
      raw: input.raw,
      warning: "Mermaid preview unavailable",
    };
  }

  return {
    mode: "svg",
    svg: input.svg,
  };
}
