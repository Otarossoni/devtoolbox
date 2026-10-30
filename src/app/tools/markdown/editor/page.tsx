"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  MarkdownLogoIcon,
  TextAlignLeftIcon,
  EyeIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextArea, Select } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allows http(s), mailto, image data URIs and relative URLs; anything else (javascript:, vbscript:…) becomes "#" */
function safeUrl(url: string): string {
  const decoded = url.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  const scheme = decoded.match(/^([a-z][a-z0-9+.-]*):/i);
  if (!scheme) return url;
  const s = scheme[1].toLowerCase();
  if (s === "http" || s === "https" || s === "mailto") return url;
  if (s === "data" && /^data:image\/(png|jpe?g|gif|webp);/i.test(decoded)) return url;
  return "#";
}

function renderMarkdown(md: string): string {
  // Phase 1: Protect special blocks by replacing them with placeholders
  const protectedBlocks: string[] = [];
  let text = md;

  // Code blocks (```...```)
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const i = protectedBlocks.length;
    const langClass = lang ? ` class="language-${lang}"` : "";
    protectedBlocks.push(`<pre class="my-3 overflow-auto rounded-segment bg-surface px-3.5 py-3 font-mono text-[13px] leading-[1.6] text-fg"><code${langClass}>${escapeHTML(code.trim())}</code></pre>`);
    return `\x00B${i}\x00`;
  });

  // Inline code (`...`)
  text = text.replace(/`([^`]+)`/g, (_m, code) => {
    const i = protectedBlocks.length;
    protectedBlocks.push(`<code class="rounded-inline bg-surface-elevated px-1.5 py-0.5 font-mono text-[13px] text-syntax-string">${escapeHTML(code)}</code>`);
    return `\x00B${i}\x00`;
  });

  // Blockquotes
  text = text.replace(/^>\s?(.+)$/gm, (_m, content) => {
    const i = protectedBlocks.length;
    protectedBlocks.push(`<blockquote class="my-3 rounded-segment bg-accent-tint px-3.5 py-2.5 text-sm leading-[1.6] text-fg">${escapeHTML(content)}</blockquote>`);
    return `\x00B${i}\x00`;
  });

  // Phase 2: Escape all remaining HTML
  text = escapeHTML(text);

  // Phase 3: Restore all protected blocks
  text = text.replace(/\x00B(\d+)\x00/g, (_m, i) => protectedBlocks[parseInt(i)]);

  // Phase 4: Markdown → HTML transformations
  // Headings
  text = text.replace(/^###### (.+)$/gm, '<h6 class="mt-4 mb-1 text-xs font-semibold text-fg-secondary">$1</h6>');
  text = text.replace(/^##### (.+)$/gm, '<h5 class="mt-4 mb-1 text-sm font-semibold text-fg">$1</h5>');
  text = text.replace(/^#### (.+)$/gm, '<h4 class="mt-4 mb-1 text-base font-semibold text-fg">$1</h4>');
  text = text.replace(/^### (.+)$/gm, '<h3 class="mt-4 mb-1.5 text-base font-semibold text-fg">$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2 class="mt-[22px] mb-2 text-[19px] font-bold tracking-[-0.02em] text-fg">$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1 class="mt-1 mb-3 text-2xl font-bold tracking-[-0.025em] text-fg">$1</h1>');

  // Horizontal rule
  text = text.replace(/^(---|\*\*\*|___)$/gm, '<hr class="my-4 border-0" />');

  // Images before links (to avoid conflict)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}" class="my-2 max-w-full rounded-segment" />`);

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => `<a href="${safeUrl(href)}" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">${label}</a>`);

  // Bold + Italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-fg">$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del class="text-fg-tertiary">$1</del>');

  // Tables
  text = text.replace(
    /^\|(.+)\|$\n^\|[-| :]+\|$\n((?:^\|.+\|$\n?)*)/gm,
    (_m, header, body) => {
      const hCells = header.split("|").filter((c: string) => c.trim() !== "");
      const bRows = String(body || "").trim().split("\n").filter(Boolean).map((r: string) =>
        r.split("|").filter((c: string) => c.trim() !== ""),
      );
      const th = `<tr class="bg-surface-elevated">${hCells.map((c: string) => `<th class="px-3 py-2 text-left text-[13px] font-semibold text-fg">${c.trim()}</th>`).join("")}</tr>`;
      const tb = bRows.map((row: string[]) =>
        `<tr class="even:bg-row-stripe">${row.map((c: string) => `<td class="px-3 py-2 text-[13px] text-fg-secondary">${c.trim()}</td>`).join("")}</tr>`,
      ).join("");
      return `<div class="my-3 overflow-auto rounded-segment"><table class="w-full border-collapse">${th}${tb}</table></div>`;
    },
  );

  // Checklists
  let checkIdx = 0;
  text = text.replace(/- \[([ x])\] (.+)/g, (_m, check, label) => {
    const checked = check === "x" ? "checked" : "";
    const idx = checkIdx++;
    return `<label class="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-fg-secondary"><input type="checkbox" ${checked} data-idx="${idx}" class="size-4 cursor-pointer accent-accent" /> ${label}</label>`;
  });

  // Unordered lists
  text = text.replace(/((?:^[\*\-] .+$\n?)+)/gm, (match) => {
    const items = match.trim().split("\n").map((l) =>
      l.replace(/^[\*\-] (.+)$/, '<li class="ml-5 list-disc text-sm leading-[1.6] text-fg-secondary">$1</li>'),
    ).join("");
    return `<ul class="my-2 space-y-1">${items}</ul>`;
  });

  // Ordered lists
  text = text.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match.trim().split("\n").map((l) =>
      l.replace(/^\d+\. (.+)$/, '<li class="ml-5 list-decimal text-sm leading-[1.6] text-fg-secondary">$1</li>'),
    ).join("");
    return `<ol class="my-2 space-y-1">${items}</ol>`;
  });

  // Paragraphs
  text = text.replace(/^(?!<[a-z]|<hr|<div|<table|<ul|<ol|<blockquote|<pre|<label|<code)(.+)$/gm, '<p class="my-1 text-sm leading-[1.65] text-fg-secondary">$1</p>');

  // Clean empty paragraphs
  text = text.replace(/<p class="my-1 text-sm leading-\[1\.65\] text-fg-secondary"><\/p>/g, "");

  return text;
}

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState("");
  const [view, setView] = useState<"split" | "preview" | "write">("split");
  const [copied, setCopied] = useState(false);
  const [copyMode, setCopyMode] = useState<"md" | "html">("md");
  const previewRef = useRef<HTMLDivElement>(null);

  const preview = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    if (!previewRef.current) return;
    const boxes = previewRef.current.querySelectorAll<HTMLInputElement>("input[data-idx]");
    const handler = (e: Event) => {
      const cb = e.target as HTMLInputElement;
      const idx = parseInt(cb.dataset.idx || "0");
      cb.checked = !cb.checked;
      const lines = markdown.split("\n");
      let count = 0;
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^- \[([ x])\] (.+)/);
        if (m) {
          if (count === idx) {
            const newCheck = m[1] === "x" ? " " : "x";
            lines[i] = `- [${newCheck}] ${m[2]}`;
            setMarkdown(lines.join("\n"));
            break;
          }
          count++;
        }
      }
    };
    boxes.forEach((b) => b.addEventListener("click", handler));
    return () => boxes.forEach((b) => b.removeEventListener("click", handler));
  }, [preview, markdown]);

  const handleCopy = useCallback(async () => {
    const text = copyMode === "md" ? markdown : preview;
    try {
      await navigator.clipboard.writeText(copyMode === "md" ? markdown : preview);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown, preview, copyMode]);

  return (
    <ToolPage width="wide">
      <ToolHeader
        icon={MarkdownLogoIcon}
        title="Markdown Editor"
        description="Write and preview Markdown in real time"
      />

      <CardStack>
        <Card>
          <div className="flex min-h-control flex-wrap items-center justify-between gap-3">
            <SegmentedControl
              ariaLabel="View"
              value={view}
              onChange={setView}
              options={[
                { value: "write", icon: TextAlignLeftIcon, label: "Write" },
                { value: "split", icon: EyeIcon, label: "Split" },
                { value: "preview", icon: EyeIcon, label: "Preview" },
              ]}
            />
            <div className="flex items-center gap-2">
              <Select
                size="sm"
                aria-label="Copy format"
                value={copyMode}
                onChange={(e) => setCopyMode(e.target.value as "md" | "html")}
              >
                <option value="md">Copy Markdown</option>
                <option value="html">Copy HTML</option>
              </Select>
              <CopyButton copied={copied} onClick={handleCopy} />
            </div>
          </div>

          <div className={`grid ${view === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-4`}>
            {view !== "preview" && (
              <TextArea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write Markdown here..."
                aria-label="Markdown"
                rows={20}
                className="leading-[1.7]!"
              />
            )}
            {view !== "write" && (
              <div
                ref={previewRef}
                className="markdown-body max-h-[540px] overflow-auto rounded-control bg-field px-5 py-4"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            )}
          </div>
        </Card>

        <AboutCard title="About Markdown Editor">
          <p>
            Write and preview Markdown with live rendering. Supports
            headings, bold/italic, code blocks with syntax highlighting,
            links, images, blockquotes, task lists, and tables.
          </p>
          <p>
            Switch between <strong>Write</strong>, <strong>Split</strong>{" "}
            (side-by-side), and <strong>Preview</strong> modes. Copy output
            as raw Markdown or rendered HTML. All processing happens locally.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
