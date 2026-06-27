"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  MarkdownLogoIcon,
  CopyIcon,
  CheckIcon,
  TextAlignLeftIcon,
  EyeIcon,
} from "@phosphor-icons/react/dist/ssr";

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(md: string): string {
  // Phase 1: Protect special blocks by replacing them with placeholders
  const protectedBlocks: string[] = [];
  let text = md;

  // Code blocks (```...```)
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const i = protectedBlocks.length;
    const langClass = lang ? ` class="language-${lang}"` : "";
    protectedBlocks.push(`<pre class="rounded-lg bg-black border border-[#262626] p-3 overflow-auto text-sm"><code${langClass}>${escapeHTML(code.trim())}</code></pre>`);
    return `\x00B${i}\x00`;
  });

  // Inline code (`...`)
  text = text.replace(/`([^`]+)`/g, (_m, code) => {
    const i = protectedBlocks.length;
    protectedBlocks.push(`<code class="bg-[#171717] text-[#CE9178] px-1 py-0.5 rounded text-sm font-mono">${escapeHTML(code)}</code>`);
    return `\x00B${i}\x00`;
  });

  // Blockquotes
  text = text.replace(/^>\s?(.+)$/gm, (_m, content) => {
    const i = protectedBlocks.length;
    protectedBlocks.push(`<blockquote class="border-l-2 border-[#8A2BE2] pl-3 my-2 text-neutral-400 italic">${content}</blockquote>`);
    return `\x00B${i}\x00`;
  });

  // Phase 2: Escape all remaining HTML
  text = escapeHTML(text);

  // Phase 3: Restore all protected blocks
  text = text.replace(/\x00B(\d+)\x00/g, (_m, i) => protectedBlocks[parseInt(i)]);

  // Phase 4: Markdown → HTML transformations
  // Headings
  text = text.replace(/^###### (.+)$/gm, '<h6 class="text-xs font-semibold text-neutral-300 mt-4 mb-1">$1</h6>');
  text = text.replace(/^##### (.+)$/gm, '<h5 class="text-sm font-semibold text-neutral-200 mt-4 mb-1">$1</h5>');
  text = text.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-neutral-200 mt-4 mb-1">$1</h4>');
  text = text.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[#ededed] mt-5 mb-2">$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-[#ededed] mt-6 mb-2">$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#ededed] mt-6 mb-3">$1</h1>');

  // Horizontal rule
  text = text.replace(/^(---|\*\*\*|___)$/gm, '<hr class="border-[#262626] my-4" />');

  // Images before links (to avoid conflict)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg border border-[#262626] my-2" />');

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#569CD6] hover:underline" target="_blank" rel="noopener">$1</a>');

  // Bold + Italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#ededed]">$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del class="text-neutral-500">$1</del>');

  // Tables
  text = text.replace(
    /^\|(.+)\|$\n^\|[-| :]+\|$\n((?:^\|.+\|$\n?)*)/gm,
    (_m, header, _sep, body) => {
      const hCells = header.split("|").filter((c: string) => c.trim() !== "");
      const bRows = String(body || "").trim().split("\n").filter(Boolean).map((r: string) =>
        r.split("|").filter((c: string) => c.trim() !== ""),
      );
      const th = `<tr class="border-b border-[#262626]">${hCells.map((c: string) => `<th class="px-3 py-2 text-left text-xs font-medium text-neutral-300">${c.trim()}</th>`).join("")}</tr>`;
      const tb = bRows.map((row: string[]) =>
        `<tr class="border-b border-[#262626]/50">${row.map((c: string) => `<td class="px-3 py-1.5 text-sm text-neutral-400">${c.trim()}</td>`).join("")}</tr>`,
      ).join("");
      return `<div class="overflow-auto my-3"><table class="w-full border border-[#262626] rounded-lg overflow-hidden">${th}${tb}</table></div>`;
    },
  );

  // Checklists
  let checkIdx = 0;
  text = text.replace(/- \[([ x])\] (.+)/g, (_m, check, label) => {
    const checked = check === "x" ? "checked" : "";
    const idx = checkIdx++;
    return `<label class="flex items-center gap-2 my-1 text-sm text-neutral-400 cursor-pointer"><input type="checkbox" ${checked} data-idx="${idx}" class="accent-[#8A2BE2] cursor-pointer" /> ${label}</label>`;
  });

  // Unordered lists
  text = text.replace(/((?:^[\*\-] .+$\n?)+)/gm, (match) => {
    const items = match.trim().split("\n").map((l) =>
      l.replace(/^[\*\-] (.+)$/, '<li class="text-sm text-neutral-400 ml-4 list-disc">$1</li>'),
    ).join("");
    return `<ul class="my-2 space-y-1">${items}</ul>`;
  });

  // Ordered lists
  text = text.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match.trim().split("\n").map((l) =>
      l.replace(/^\d+\. (.+)$/, '<li class="text-sm text-neutral-400 ml-4 list-decimal">$1</li>'),
    ).join("");
    return `<ol class="my-2 space-y-1">${items}</ol>`;
  });

  // Paragraphs
  text = text.replace(/^(?!<[a-z]|<hr|<div|<table|<ul|<ol|<blockquote|<pre|<label|<code)(.+)$/gm, '<p class="text-sm text-neutral-400 leading-relaxed my-1">$1</p>');

  // Clean empty paragraphs
  text = text.replace(/<p class="text-sm text-neutral-400 leading-relaxed my-1"><\/p>/g, "");

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
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-6xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <MarkdownLogoIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Markdown Editor</h1>
            <p className="text-sm text-neutral-500">
              Write and preview Markdown in real time
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {[
                { key: "write" as const, icon: TextAlignLeftIcon, label: "Write" },
                { key: "split" as const, icon: EyeIcon, label: "Split" },
                { key: "preview" as const, icon: EyeIcon, label: "Preview" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                    view === v.key
                      ? "bg-[#171717] text-[#8A2BE2] border-[#8A2BE2]/30"
                      : "text-neutral-500 hover:text-[#ededed] border-transparent"
                  }`}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={copyMode}
                onChange={(e) => setCopyMode(e.target.value as "md" | "html")}
                className="px-2 py-1 rounded-md bg-[#171717] border border-[#262626] text-xs text-neutral-400 outline-none cursor-pointer"
              >
                <option value="md">Copy Markdown</option>
                <option value="html">Copy HTML</option>
              </select>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  copied
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`grid ${view === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-4`}>
            {view !== "preview" && (
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write Markdown here..."
                rows={20}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none leading-relaxed"
              />
            )}
            {view !== "write" && (
              <div
                ref={previewRef}
                className="rounded-lg bg-black border border-[#262626] p-4 overflow-auto max-h-[540px] leading-relaxed markdown-body"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            )}
          </div>
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Markdown Editor</h2>
          <div className="space-y-3 text-sm text-neutral-400">
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
          </div>
        </div>
      </div>
    </div>
  );
}
