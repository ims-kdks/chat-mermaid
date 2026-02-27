import { beforeEach, describe, expect, it, vi } from "vitest";

const rendererState = vi.hoisted(() => ({
  mode: "success" as "success" | "render-fail" | "import-fail",
}));

vi.mock("beautiful-mermaid", () => {
  if (rendererState.mode === "import-fail") {
    throw new Error("renderer import failed");
  }

  return {
    renderMermaidSVG: (code: string) => {
      if (rendererState.mode !== "success") {
        throw new Error("renderer failed");
      }
      return `<svg>${code}</svg>`;
    },
    renderMermaid: (code: string) => {
      if (rendererState.mode !== "success") {
        throw new Error("renderer failed");
      }
      return `<svg>${code}</svg>`;
    },
    default: {
      renderMermaidSVG: (code: string) => {
        if (rendererState.mode !== "success") {
          throw new Error("renderer failed");
        }
        return `<svg>${code}</svg>`;
      },
      renderMermaid: (code: string) => {
        if (rendererState.mode !== "success") {
          throw new Error("renderer failed");
        }
        return `<svg>${code}</svg>`;
      },
    },
  };
});

describe("plugin message transform integration", () => {
  beforeEach(() => {
    vi.resetModules();
    rendererState.mode = "success";
  });

  it("exposes experimental chat message transform hook", async () => {
    const { default: plugin } = await import("../../src/index");

    expect(plugin).toHaveProperty("experimental.chat.messages.transform");
    expect(typeof plugin.experimental.chat.messages.transform).toBe("function");
  });

  it("adds mermaid previews for model messages only and uses chat payload shape", async () => {
    const { default: plugin } = await import("../../src/index");

    const modelMessage = {
      id: "m-model",
      role: "model",
      parts: [{ id: "p1", type: "text", text: "```mermaid\ngraph TD\nA-->B\n```" }],
      info: {},
    };
    const assistantMessage = {
      id: "m-assistant",
      role: "assistant",
      parts: [{ id: "p1", type: "text", text: "```mermaid\ngraph TD\nA-->B\n```" }],
      info: {},
    };
    const userMessage = {
      id: "m-user",
      role: "user",
      parts: [{ id: "p1", type: "text", text: "```mermaid\ngraph TD\nB-->C\n```" }],
      info: {},
    };

    const transformed = await plugin.experimental.chat.messages.transform({
      messages: [modelMessage, assistantMessage, userMessage],
    });

    expect(transformed[0].info.mermaidPreviews).toHaveLength(1);
    expect(transformed[0].info.mermaidPreviews[0].renderResult.status).toBe("success");
    expect(transformed[0].info.mermaidPreviews[0].renderResult.payload).toEqual(
      expect.objectContaining({
        kind: "image",
        mimeType: "image/svg+xml",
      }),
    );
    expect(transformed[0].info.mermaidPreviews[0].renderResult.payload.svgMarkup).toContain("<svg");
    expect(transformed[0].parts).toEqual(modelMessage.parts);
    expect(transformed[1].info.mermaidPreviews).toBeUndefined();
    expect(transformed[1].parts).toEqual(assistantMessage.parts);
    expect(transformed[2].info.mermaidPreviews).toBeUndefined();
    expect(transformed[2].parts).toEqual(userMessage.parts);
  });

  it("adds fallback preview metadata when renderer import fails", async () => {
    rendererState.mode = "import-fail";
    const { default: plugin } = await import("../../src/index");

    const transformed = await plugin.experimental.chat.messages.transform({
      messages: [
        {
          id: "m-model",
          role: "model",
          parts: [{ id: "p1", type: "text", text: "```mermaid\nflowchart TD\nA-->B\n```" }],
          info: {},
        },
      ],
    });

    expect(transformed[0].info?.mermaidPreviews).toEqual([
      {
        messageId: "m-model",
        partId: "p1",
        blockIndex: 0,
        code: "flowchart TD\nA-->B",
        blockHash: "m-model:p1:0:flowchart TD\nA-->B",
        renderResult: {
          status: "error",
          warning: "Mermaid preview unavailable",
        },
      },
    ]);
  });

  it("handles malformed input and keeps processing valid messages", async () => {
    const { default: plugin } = await import("../../src/index");

    await expect(
      plugin.experimental.chat.messages.transform({
        messages: "nope" as unknown as any[],
      }),
    ).resolves.toEqual([]);

    const badMessage = Object.defineProperty({}, "role", {
      get() {
        throw new Error("bad message");
      },
    });
    const badPart = Object.defineProperty({}, "text", {
      get() {
        throw new Error("bad part");
      },
    });

    const transformed = await plugin.experimental.chat.messages.transform({
      messages: [
        {
          id: "m-good-1",
          role: "model",
          parts: [{ id: "p1", type: "text", text: "```mermaid\nA-->B\n```" }],
          info: {},
        },
        badMessage as any,
        {
          id: "m-bad-part",
          role: "model",
          parts: [badPart as any, { id: "p2", type: "text", text: "```mermaid\nB-->C\n```" }],
          info: {},
        },
        {
          id: "m-bad-parts-shape",
          role: "model",
          parts: { type: "text", text: "```mermaid\nC-->D\n```" } as unknown as any[],
          info: {},
        },
        {
          id: "m-good-2",
          role: "model",
          parts: [{ id: "p3", type: "text", text: "```mermaid\nD-->E\n```" }],
          info: {},
        },
      ],
    });

    expect(transformed).toHaveLength(5);
    expect(transformed[0].info?.mermaidPreviews).toHaveLength(1);
    expect(transformed[1]).toBe(badMessage);
    expect(transformed[2].info?.mermaidPreviews).toHaveLength(1);
    expect(transformed[3].info?.mermaidPreviews).toBeUndefined();
    expect(transformed[4].info?.mermaidPreviews).toHaveLength(1);
  });
});
