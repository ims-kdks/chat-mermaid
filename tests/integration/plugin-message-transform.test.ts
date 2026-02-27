import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("beautiful-mermaid", () => ({
  renderMermaid: (code: string) => `<svg>${code}</svg>`,
}));

describe("plugin message transform integration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exposes experimental chat message transform hook", async () => {
    const { default: plugin } = await import("../../src/index");

    expect(plugin).toHaveProperty("experimental.chat.messages.transform");
    expect(typeof plugin.experimental.chat.messages.transform).toBe("function");
  });

  it("adds mermaid previews for assistant messages only", async () => {
    const { default: plugin } = await import("../../src/index");

    const assistantMessage = {
      id: "m-assistant",
      role: "assistant",
      parts: [{ id: "p1", type: "text", text: "```mermaid\nflowchart TD\nA-->B\n```" }],
      info: {},
    };
    const userMessage = {
      id: "m-user",
      role: "user",
      parts: [{ id: "p1", type: "text", text: "```mermaid\nflowchart TD\nB-->C\n```" }],
      info: {},
    };

    const transformed = await plugin.experimental.chat.messages.transform({
      messages: [assistantMessage, userMessage],
    });

    expect(transformed[0].info.mermaidPreviews).toHaveLength(1);
    expect(transformed[0].parts).toEqual(assistantMessage.parts);
    expect(transformed[1].info.mermaidPreviews).toBeUndefined();
    expect(transformed[1].parts).toEqual(userMessage.parts);
  });
});
