export type ChatPreviewPayload = {
  kind: "image";
  mimeType: "image/svg+xml";
  data: string;
};

export function createChatPreviewPayload(svg: string): ChatPreviewPayload {
  return {
    kind: "image",
    mimeType: "image/svg+xml",
    data: svg,
  };
}
