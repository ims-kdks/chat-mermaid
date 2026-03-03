import type { Plugin } from "@opencode-ai/plugin";
import { createRenderCoordinator, type RenderResult } from "./core/render-coordinator";
import { createChatPreviewPayload, type ChatPreviewPayload } from "./adapters/chat-adapter";

type MermaidRendererModule = {
  renderMermaidSVG?: (code: string) => string | Promise<string>;
  renderMermaid?: (code: string) => string | Promise<string>;
};

type TextCompleteInput = {
  sessionID: string;
  messageID: string;
  partID: string;
};

type TextCompleteOutput = {
  text: string;
};

let rendererPromise: Promise<(code: string) => Promise<string>> | undefined;

async function loadRenderer(): Promise<(code: string) => Promise<string>> {
  if (rendererPromise) {
    return rendererPromise;
  }

  const newRendererPromise = (async () => {
    const mod = (await import("beautiful-mermaid")) as MermaidRendererModule;
    const renderer =
      typeof mod.renderMermaidSVG === "function"
        ? mod.renderMermaidSVG
        : typeof mod.renderMermaid === "function"
          ? mod.renderMermaid
          : undefined;

    if (!renderer) {
      throw new Error("beautiful-mermaid renderer function is unavailable");
    }

    return async (code: string) => Promise.resolve(renderer(code));
  })();

  rendererPromise = newRendererPromise;
  return newRendererPromise;
}

const renderCoordinator = createRenderCoordinator(async (code) => {
  const renderer = await loadRenderer();
  return renderer(code);
});

function toTransformRenderResult(result: RenderResult):
  | {
      status: "success";
      payload: ChatPreviewPayload;
    }
  | {
      status: "error";
      warning: "Mermaid preview unavailable";
    } {
  if (result.status === "success") {
    return {
      status: "success",
      payload: createChatPreviewPayload(result.svg),
    };
  }

  return result;
}

function toSvgDataUrl(svgMarkup: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
}

async function renderMermaidInText(text: string): Promise<string> {
  const fencePattern = /```mermaid[ \t]*\r?\n([\s\S]*?)```/g;
  let transformed = "";
  let cursor = 0;
  let blockIndex = 0;

  for (const match of text.matchAll(fencePattern)) {
    const start = match.index ?? cursor;
    const fullBlock = match[0] ?? "";
    const code = (match[1] ?? "").trim();

    transformed += text.slice(cursor, start);
    cursor = start + fullBlock.length;

    if (!code) {
      transformed += fullBlock;
      blockIndex += 1;
      continue;
    }

    const renderResult = toTransformRenderResult(
      await renderCoordinator.render(`text-complete:text:${blockIndex}:${code}`, code),
    );

    if (renderResult.status === "success") {
      transformed += `![Mermaid diagram](${toSvgDataUrl(renderResult.payload.svgMarkup)})`;
      blockIndex += 1;
      continue;
    }

    transformed += `${fullBlock}\n\n> Mermaid preview unavailable`;
    blockIndex += 1;
  }

  if (blockIndex === 0) {
    return text;
  }

  transformed += text.slice(cursor);
  return transformed;
}

export const ChatMermaidPlugin: Plugin = async () => {
  return {
    "experimental.text.complete": async (
      _input: TextCompleteInput,
      output: TextCompleteOutput,
    ): Promise<void> => {
      output.text = await renderMermaidInText(output.text);
    },
  };
};

export default ChatMermaidPlugin;

export { handleTuiPreview } from "./adapters/tui-adapter";
export { createChatPreviewPayload } from "./adapters/chat-adapter";
export { createPreviewStateStore } from "./state/preview-state-store";
