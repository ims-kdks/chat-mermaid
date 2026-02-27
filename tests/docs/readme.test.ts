import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README docs", () => {
  const text = readFileSync("README.md", "utf8");

  it("documents required preview behaviors", () => {
    expect(text).toContain("TUI auto-preview");
    expect(text).toMatch(
      /Web\/Desktop toggle: in chat, use the bottom-of-message toggle/i,
    );
    expect(text).toContain("Fallback raw block + warning");
  });

  it("includes a manual verification section with required commands", () => {
    expect(text).toMatch(/^## Manual verification$/m);
    expect(text).toContain("npm test -- tests/docs/readme.test.ts");
    expect(text).toContain("npm run build");
    expect(text).toContain("npm test");
  });

  it("documents expected outcomes for docs test, build, and full test run", () => {
    expect(text).toContain("Expected outcome:");
    expect(text).toContain("The test passes.");
    expect(text).toContain("A `dist/` directory is produced");
    expect(text).toContain("All tests pass.");
  });
});
