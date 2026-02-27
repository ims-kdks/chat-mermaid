export type MermaidBlock = {
  messageId: string;
  partId: string;
  blockIndex: number;
  code: string;
  blockHash: string;
};

export function detectMermaidBlocks(messageId: string, partId: string, text: string): MermaidBlock[] {
  const regex = /```mermaid[ \t]*\r?\n([\s\S]*?)```/g;
  const blocks: MermaidBlock[] = [];
  let match: RegExpExecArray | null;
  let index = 0;

  match = regex.exec(text);
  while (match !== null) {
    const code = match[1].trim();
    blocks.push({
      messageId,
      partId,
      blockIndex: index,
      code,
      blockHash: `${messageId}:${partId}:${index}:${code}`,
    });
    index += 1;
    match = regex.exec(text);
  }

  return blocks;
}
