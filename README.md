# chat-mermaid

Render Mermaid diagrams in chat responses for [OpenCode](https://opencode.ai).

## Install

Add to your OpenCode config, then restart OpenCode:

```yaml
{
  "plugin": ["chat-mermaid@latest"]
}
```

## Usage

Mermaid code blocks in chat responses are automatically converted to SVG images.

## Limitations

- **No toggle**: Cannot turn on/off per message or session - once installed, all mermaid blocks are rendered
- **No configuration**: Cannot customize themes, styles, or rendering options
- **All-or-nothing**: Cannot selectively render certain blocks while keeping others as raw code
- **No fallback control**: When rendering fails, the warning message cannot be customized or disabled

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT
