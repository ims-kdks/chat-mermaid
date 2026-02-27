export type ChatPreviewPayload = {
  kind: "image";
  mimeType: "image/svg+xml";
  svgMarkup: string;
};

export function createChatPreviewPayload(svgMarkup: string): ChatPreviewPayload {
  return {
    kind: "image",
    mimeType: "image/svg+xml",
    svgMarkup,
  };
}
