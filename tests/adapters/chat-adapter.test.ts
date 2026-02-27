import { describe, expect, it } from "vitest";
import { createChatPreviewPayload } from "../../src/adapters/chat-adapter";
import { createPreviewStateStore } from "../../src/state/preview-state-store";

describe("chat preview state", () => {
  it("defaults to closed and toggles open/closed", () => {
    const store = createPreviewStateStore();

    expect(store.get("m1:p1:0")).toBe("closed");

    store.toggle("m1:p1:0");
    expect(store.get("m1:p1:0")).toBe("open");

    store.toggle("m1:p1:0");
    expect(store.get("m1:p1:0")).toBe("closed");
  });
});

describe("createChatPreviewPayload", () => {
  it("returns an svg display payload contract", () => {
    expect(createChatPreviewPayload("<svg/>")).toEqual({
      kind: "image",
      mimeType: "image/svg+xml",
      data: "<svg/>",
    });
  });
});
