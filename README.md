# Mermaid Preview Plugin

This plugin detects Mermaid blocks in chat responses and renders previews with environment-aware behavior.

## Key behavior

- TUI auto-preview: Mermaid blocks in responses are detected and rendered automatically in TUI.
- Web/Desktop toggle: in chat, use the bottom-of-message toggle to switch between Web and Desktop rendering paths.
- Fallback raw block + warning: if rendering is unavailable, the plugin shows the original Mermaid block and a warning.

## Manual verification

1. Run docs tests for this README.

   ```bash
   npm test -- tests/docs/readme.test.ts
   ```

   Expected outcome:
   - The test passes.
   - Output confirms README includes key behavior notes and manual verification instructions.

2. Build distributable output.

   ```bash
   npm run build
   ```

   Expected outcome:
   - TypeScript compilation succeeds.
   - A `dist/` directory is produced with compiled JavaScript output for `src/`.

3. Run full test suite.

   ```bash
   npm test
   ```

   Expected outcome:
   - All tests pass.
   - No failing docs or behavior assertions.
