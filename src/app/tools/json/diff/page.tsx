"use client";

import { useState, useMemo } from "react";
import { GitDiffIcon } from "@phosphor-icons/react/dist/ssr";
import { diffJSON, type DiffNode, type DiffType } from "@/lib/json";

const TYPE_COLORS: Record<DiffType, string> = {
  same: "text-[#ededed]",
  added: "text-green-400",
  removed: "text-red-400",
  changed: "text-amber-400",
};

function DiffTreeNode({ node, depth }: { node: DiffNode; depth: number }) {
  const hasChildren = node.children.length > 0;

  if (!hasChildren) {
    const prefix = node.type === "added" ? "+ " : node.type === "removed" ? "- " : "  ";
    const color = TYPE_COLORS[node.type];
    const val = node.type === "added" ? node.newValue : node.type === "removed" ? node.oldValue : node.type === "changed" ? `${node.oldValue} → ${node.newValue}` : node.oldValue;
    return (
      <div className="font-mono text-[13px] leading-5" style={{ paddingLeft: depth * 16 }}>
        <span className="text-neutral-500 w-6 inline-block">{prefix}</span>
        {node.key !== null && <span className="text-[#9CDCFE]">{node.key}</span>}
        {node.key !== null && <span className="text-neutral-600">: </span>}
        <span className={color}>{val}</span>
      </div>
    );
  }

  const summary = node.type === "changed" && !node.children.every((c) => c.type !== "same") ? "(mixed)" : "";

  return (
    <div className="font-mono text-[13px] leading-5" style={{ paddingLeft: depth * 16 }}>
      <div className="flex items-center gap-1">
        <span className={`w-6 text-xs shrink-0 ${TYPE_COLORS[node.type]}`}>
          {node.type === "added" ? "+" : node.type === "removed" ? "-" : " "}
        </span>
        {node.key !== null && <span className="text-[#9CDCFE]">{node.key}</span>}
        {node.key !== null && <span className="text-neutral-600">: </span>}
        <span className={TYPE_COLORS[node.type]}>
          {node.type === "added" ? (node.newValue || "{...}") : node.type === "removed" ? (node.oldValue || "{...}") : (node.oldValue || "{...}")}{summary}
        </span>
      </div>
      {node.children.map((child, i) => (
        <DiffTreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function JSONDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [compared, setCompared] = useState(false);

  const leftParsed = useMemo(() => {
    try { return JSON.parse(left); } catch { return null; }
  }, [left]);
  const rightParsed = useMemo(() => {
    try { return JSON.parse(right); } catch { return null; }
  }, [right]);

  const diff = useMemo(() => {
    if (!leftParsed || !rightParsed) return null;
    return diffJSON(leftParsed, rightParsed);
  }, [leftParsed, rightParsed]);

  const handleCompare = () => setCompared(true);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <GitDiffIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">JSON Diff</h1>
            <p className="text-sm text-neutral-500">
              Compare two JSON objects and find differences
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Original</span>
                {left && (leftParsed ? <span className="text-xs text-green-500">✓</span> : <span className="text-xs text-red-400">✗</span>)}
              </div>
              <textarea
                value={left}
                onChange={(e) => { setLeft(e.target.value); setCompared(false); }}
                placeholder='{"name": "Alice"}'
                rows={10}
                spellCheck={false}
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Modified</span>
                {right && (rightParsed ? <span className="text-xs text-green-500">✓</span> : <span className="text-xs text-red-400">✗</span>)}
              </div>
              <textarea
                value={right}
                onChange={(e) => { setRight(e.target.value); setCompared(false); }}
                placeholder='{"name": "Bob"}'
                rows={10}
                spellCheck={false}
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleCompare}
              disabled={!leftParsed || !rightParsed}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              <GitDiffIcon className="h-4 w-4" />
              Compare
            </button>
          </div>
        </div>

        {compared && diff && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Diff</span>
            </div>

            <div className="rounded-lg bg-black border border-[#262626] p-4 overflow-auto max-h-96">
              <DiffTreeNode node={diff} depth={0} />
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About JSON Diff</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Compare two JSON objects side by side. Differences are shown
              as a tree with color-coded changes.
            </p>
            <p>
              <span className="text-green-400">Green</span> — added keys.{" "}
              <span className="text-red-400">Red</span> — removed keys.{" "}
              <span className="text-amber-400">Amber</span> — changed values.
              Unchanged keys are left in the default color.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
