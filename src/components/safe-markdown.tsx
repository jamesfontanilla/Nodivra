import type { ReactNode } from "react";
import { isSafeHttpUrl } from "@/lib/validation";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; text: string };

function parseMarkdown(input: string): MarkdownBlock[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list && list.items.length > 0) {
      blocks.push({ type: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      if (code) {
        blocks.push({ type: "code", text: code.join("\n") });
        code = null;
      } else {
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: line.startsWith("###") ? 3 : 2, text: heading[1] });
      continue;
    }

    const listItem = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      const ordered = /\d+\./.test(listItem[1]!);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(listItem[2]!);
      continue;
    }

    if (line.match(/^>\s+/)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: line.replace(/^>\s+/, "") });
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (code) {
    blocks.push({ type: "code", text: code.join("\n") });
  }
  return blocks;
}

function renderInline(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(value))) {
    if (match.index > cursor) {
      nodes.push(value.slice(cursor, match.index));
    }
    const label = match[1]!;
    const url = match[2]!.trim();
    nodes.push(
      isSafeHttpUrl(url) ? (
        <a key={`link-${index}`} href={url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-4 transition-[color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-sand-50">
          {label}
        </a>
      ) : label,
    );
    cursor = match.index + match[0].length;
    index += 1;
  }

  if (cursor < value.length) {
    nodes.push(value.slice(cursor));
  }
  return nodes;
}

export function SafeMarkdown({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={className ?? "space-y-5 text-sm leading-7 text-sand-100/90"}>
      {parseMarkdown(markdown).map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2 ? (
            <h2 key={index} className="pt-3 font-display text-2xl leading-tight tracking-tight text-sand-50 sm:text-3xl">{renderInline(block.text)}</h2>
          ) : (
            <h3 key={index} className="pt-2 text-base font-medium text-sand-50">{renderInline(block.text)}</h3>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index} className={block.ordered ? "list-decimal space-y-2 pl-5" : "list-disc space-y-2 pl-5"}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
            </List>
          );
        }
        if (block.type === "quote") {
          return <blockquote key={index} className="border-l border-sand-200/30 pl-5 italic text-sand-200/80">{renderInline(block.text)}</blockquote>;
        }
        if (block.type === "code") {
          return <pre key={index} className="overflow-x-auto rounded-[1.25rem] bg-black/20 p-4 text-xs leading-6 text-sand-200/90 ring-1 ring-white/10"><code>{block.text}</code></pre>;
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
