import { describe, expect, it } from "vitest";
import { createChatPreviewPayload } from "../../src/adapters/chat-adapter";
import { createPreviewStateStore } from "../../src/state/preview-state-store";
import {
  createChatPreviewPayload as createChatPreviewPayloadFromEntrypoint,
  createPreviewStateStore as createPreviewStateStoreFromEntrypoint,
} from "../../src";

describe("chat preview state", () => {
  it("defaults to closed and toggles open/closed", () => {
    const store = createPreviewStateStore();

    expect(store.get("m1:p1:0")).toBe("closed");

    store.toggle("m1:p1:0");
    expect(store.get("m1:p1:0")).toBe("open");

    store.toggle("m1:p1:0");
    expect(store.get("m1:p1:0")).toBe("closed");
  });

  it("keeps state isolated per preview key", () => {
    const store = createPreviewStateStore();

    store.toggle("m1:p1:0");

    expect(store.get("m1:p1:0")).toBe("open");
    expect(store.get("m1:p1:1")).toBe("closed");
    expect(store.get("m2:p4:0")).toBe("closed");
  });

  it("returns next state from toggle", () => {
    const store = createPreviewStateStore();

    expect(store.toggle("m1:p1:0")).toBe("open");
    expect(store.toggle("m1:p1:0")).toBe("closed");
  });
});

describe("createChatPreviewPayload", () => {
  it("returns an svg display payload contract with explicit svg markup field", () => {
    expect(createChatPreviewPayload("<svg/>")).toEqual({
      kind: "image",
      mimeType: "image/svg+xml",
      svgMarkup: "<svg/>",
    });
  });
});

describe("entrypoint exports", () => {
  it("re-exports Task 5 chat APIs", () => {
    expect(createChatPreviewPayloadFromEntrypoint).toBe(createChatPreviewPayload);
    expect(createPreviewStateStoreFromEntrypoint).toBe(createPreviewStateStore);
  });
});
