"use client";

import { useState, useCallback, useMemo } from "react";
import {
  BracketsCurlyIcon,
  CopyIcon,
  CheckIcon,
  TreeStructureIcon,
  TextAlignLeftIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatJSON, minifyJSON, highlightJSON, buildJSONTree, type JSONNode } from "@/lib/json";

const TYPE_COLORS: Record<string, string> = {
  string: "text-[#CE9178]",
  number: "text-[#B5CEA8]",
  boolean: "text-[#569CD6]",
  null: "text-neutral-600",
  object: "text-[#9CDCFE]",
  array: "text-[#9CDCFE]",
};

function TreeNode({ node, depth }: { node: JSONNode; depth: number }) {
  const [open, setOpen] = useState(depth < 2);

  const hasChildren = node.children.length > 0 && (node.type === "object" || node.type === "array");
  const bracket = node.type === "array" ? ["[", "]"] : node.type === "object" ? ["{", "}"] : null;

  return (
    <div className="font-mono text-[13px] leading-5" style={{ paddingLeft: depth * 16 }}>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            onClick={() => setOpen(!open)}
            className="text-neutral-500 hover:text-[#ededed] cursor-pointer w-4 text-center shrink-0"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {node.key !== null && (
          <span className="text-[#9CDCFE]">{node.key}</span>
        )}
        {node.key !== null && <span className="text-neutral-600">: </span>}
        {hasChildren ? (
          open ? (
            <span className="text-neutral-500">{bracket![0]}</span>
          ) : (
            <span className="text-neutral-500">{node.value}</span>
          )
        ) : (
          <span className={TYPE_COLORS[node.type] ?? ""}>{node.value}</span>
        )}
      </div>
      {hasChildren && open && (
        <div className="border-l border-[#262626] ml-2">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
          <div className="flex" style={{ paddingLeft: depth * 16 }}>
            <span className="text-neutral-500">{bracket![1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JSONFormatterPage() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<"text" | "tree">("text");
  const [outputMode, setOutputMode] = useState<"formatted" | "minified">("formatted");
  const [copied, setCopied] = useState(false);

  const tree = useMemo(() => {
    try {
      return buildJSONTree(JSON.parse(input));
    } catch {
      return null;
    }
  }, [input]);

  const formatted = useMemo(() => formatJSON(input), [input]);
  const minified = useMemo(() => minifyJSON(input), [input]);
  const highlighted = useMemo(
    () => (formatted.result ? highlightJSON(formatted.result) : ""),
    [formatted],
  );

  const handleFormat = useCallback(() => {
    setOutputMode("formatted");
    setView("text");
  }, []);

  const handleMinify = useCallback(() => {
    setOutputMode("minified");
    setView("text");
  }, []);

  const handleCopy = useCallback(async () => {
    const text = outputMode === "formatted" ? formatted.result : minified.result;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
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
  }, [formatted.result, minified.result, outputMode]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <BracketsCurlyIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">JSON Formatter</h1>
            <p className="text-sm text-neutral-500">
              Format, validate, minify, and explore JSON
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Input
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleFormat}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  outputMode === "formatted"
                    ? "bg-[#8A2BE2] text-white border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                Format
              </button>
              <button
                onClick={handleMinify}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  outputMode === "minified"
                    ? "bg-[#8A2BE2] text-white border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                Minify
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste JSON here... e.g. {"key": "value"}'
            rows={12}
            className={`w-full px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 resize-none ${
              hasInput && formatted.error
                ? "border-red-500/50"
                : hasInput && !formatted.error
                  ? "border-green-500/50"
                  : "border-[#262626] focus:border-[#8A2BE2]"
            }`}
          />
        </div>

        {hasInput && formatted.error && (
          <div className="animate-9 rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-red-400 uppercase tracking-wider">
                Error
              </span>
            </div>
            <p className="text-sm text-red-400 font-mono">{formatted.error}</p>
          </div>
        )}

        {hasInput && !formatted.error && (formatted.result || minified.result) && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Output
              </span>
              <div className="flex items-center gap-2">
                {tree && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setView("text")}
                      className={`p-1.5 rounded transition-all duration-200 cursor-pointer border ${
                        view === "text"
                          ? "bg-[#171717] text-[#8A2BE2] border-[#8A2BE2]/30"
                          : "text-neutral-500 hover:text-[#ededed] hover:border-[#3a3a3a] border-transparent"
                      }`}
                      title="Text view"
                    >
                      <TextAlignLeftIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setView("tree")}
                      className={`p-1.5 rounded transition-all duration-200 cursor-pointer border ${
                        view === "tree"
                          ? "bg-[#171717] text-[#8A2BE2] border-[#8A2BE2]/30"
                          : "text-neutral-500 hover:text-[#ededed] hover:border-[#3a3a3a] border-transparent"
                      }`}
                      title="Tree view"
                    >
                      <TreeStructureIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
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

            {view === "text" ? (
              outputMode === "formatted" && formatted.result ? (
                <pre
                  className="rounded-lg bg-black border border-[#262626] p-4 text-sm leading-relaxed overflow-auto max-h-96"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              ) : outputMode === "minified" && minified.result ? (
                <textarea
                  value={minified.result}
                  readOnly
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none resize-none"
                />
              ) : null
            ) : tree ? (
              <div className="rounded-lg bg-black border border-[#262626] p-4 overflow-auto max-h-96">
                <TreeNode node={tree} depth={0} />
              </div>
            ) : null}
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About JSON Formatter</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Paste any JSON to format with syntax highlighting, validate
              structure, minify to compact output, or explore with the
              interactive tree view.
            </p>
            <p>
              <strong>Format</strong> — pretty-print with 2-space indentation
              and color-coded syntax. <strong>Minify</strong> — strip all
              whitespace for the smallest possible output.{" "}
              <strong>Tree</strong> — collapsible navigation for large objects.
            </p>
            <p>
              Invalid JSON shows the exact error message from the parser,
              including line and column position.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
