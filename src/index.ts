import { detectMermaidBlocks } from "./core/detect-mermaid-blocks";
import { createRenderCoordinator, type RenderResult } from "./core/render-coordinator";

type MermaidRendererModule = {
  renderMermaidSVG?: (code: string) => string | Promise<string>;
  renderMermaid?: (code: string) => string | Promise<string>;
};

type MermaidPreview = {
  messageId: string;
  partId: string;
  blockIndex: number;
  code: string;
  blockHash: string;
  renderResult: RenderResult;
};

type TransformMessage = {
  id?: string;
  role?: string;
  parts?: unknown[];
  info?: Record<string, unknown>;
};

type TextPart = {
  id?: string;
  type?: string;
  text?: string;
};

let rendererPromise: Promise<(code: string) => Promise<string>> | undefined;

async function loadRenderer(): Promise<(code: string) => Promise<string>> {
  if (!rendererPromise) {
    rendererPromise = (async () => {
      const mod = (await import("beautiful-mermaid")) as MermaidRendererModule;
      if (typeof mod.renderMermaidSVG === "function") {
        return async (code: string) => Promise.resolve(mod.renderMermaidSVG?.(code));
      }
      if (typeof mod.renderMermaid === "function") {
        return async (code: string) => Promise.resolve(mod.renderMermaid?.(code));
      }
      throw new Error("beautiful-mermaid renderer function is unavailable");
    })();
  }
  return rendererPromise;
}

const renderCoordinator = createRenderCoordinator(async (code) => {
  const renderer = await loadRenderer();
  return renderer(code);
});

async function transformMessages(input: { messages: TransformMessage[] }): Promise<TransformMessage[]> {
  const transformed: TransformMessage[] = [];

  for (const [messageIndex, message] of input.messages.entries()) {
    if (message.role !== "assistant" && message.role !== "model") {
      transformed.push(message);
      continue;
    }

    const messageId = message.id ?? `message-${messageIndex}`;
    const previews: MermaidPreview[] = [];

    for (const [partIndex, part] of (message.parts ?? []).entries()) {
      const textPart = part as TextPart;
      if (textPart.type !== "text" || typeof textPart.text !== "string") {
        continue;
      }

      const partId = textPart.id ?? `part-${partIndex}`;
      const blocks = detectMermaidBlocks(messageId, partId, textPart.text);
      for (const block of blocks) {
        const renderResult = await renderCoordinator.render(block.blockHash, block.code);
        previews.push({
          messageId,
          partId,
          blockIndex: block.blockIndex,
          code: block.code,
          blockHash: block.blockHash,
          renderResult,
        });
      }
    }

    if (previews.length === 0) {
      transformed.push(message);
      continue;
    }

    transformed.push({
      ...message,
      info: {
        ...(message.info ?? {}),
        mermaidPreviews: previews,
      },
    });
  }

  return transformed;
}

const plugin = {
  name: "mermaid-preview",
  experimental: {
    chat: {
      messages: {
        transform: transformMessages,
      },
    },
  },
};

export { handleTuiPreview } from "./adapters/tui-adapter";
export { createChatPreviewPayload } from "./adapters/chat-adapter";
export { createPreviewStateStore } from "./state/preview-state-store";

export default plugin;
