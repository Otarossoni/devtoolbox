"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { evaluateJSONPath, buildJSONTree, formatJSON, type JSONNode } from "@/lib/json";

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
        {node.key !== null && <span className="text-[#9CDCFE]">{node.key}</span>}
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

export default function JSONPathPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [pathInput, setPathInput] = useState("");

  const parsed = useMemo(() => {
    try { return JSON.parse(jsonInput); } catch { return null; }
  }, [jsonInput]);

  const result = useMemo(() => {
    if (!parsed || !pathInput.trim()) return null;
    return evaluateJSONPath(parsed, pathInput.trim());
  }, [parsed, pathInput]);

  const resultTree = useMemo(() => {
    if (!result?.value && result?.value !== 0 && result?.value !== false && result?.value !== "") return null;
    return buildJSONTree(result.value);
  }, [result]);

  const resultJSON = useMemo(() => {
    if (!result?.value && result?.value !== 0 && result?.value !== false && result?.value !== "") return "";
    return formatJSON(JSON.stringify(result.value)).result;
  }, [result]);

  const hasJSON = jsonInput.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">JSON Path</h1>
            <p className="text-sm text-neutral-500">
              Extract values from JSON using path expressions
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              JSON Input
            </span>
            {hasJSON && (parsed ? <span className="text-xs text-green-500">✓</span> : <span className="text-xs text-red-400">✗</span>)}
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste JSON here... e.g. {"store":{"books":[{"title":"A"},{"title":"B"}]}}'
            rows={8}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Path</span>
          </div>

          <div className="flex items-center gap-1 bg-black border border-[#262626] rounded-lg px-3 py-2 text-sm font-mono">
            <span className="text-neutral-500">$.</span>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder="store.books[0].title"
              className="flex-1 bg-transparent text-[#ededed] placeholder:text-neutral-600 outline-none"
            />
          </div>

          <p className="text-xs text-neutral-600 mt-3">
            <span className="mr-1">Examples:</span>
            <code className="text-neutral-500">name</code>
            <span className="mx-1 text-neutral-700">·</span>
            <code className="text-neutral-500">users[0].email</code>
            <span className="mx-1 text-neutral-700">·</span>
            <code className="text-neutral-500">items[*].id</code>
            <span className="mx-1 text-neutral-700">·</span>
            <code className="text-neutral-500">list[0:3]</code>
          </p>
        </div>

        {result?.error && (
          <div className="animate-9 rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-red-400 uppercase tracking-wider">Error</span>
            </div>
            <span className="text-sm text-red-400 font-mono">{result.error}</span>
          </div>
        )}

        {result && !result.error && resultTree && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Result</span>
            </div>

            <div className="rounded-lg bg-black border border-[#262626] p-4 overflow-auto max-h-80">
              <TreeNode node={resultTree} depth={0} />
            </div>

            {resultJSON && (
              <div className="mt-3">
                <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                  Raw JSON
                </span>
                <pre className="rounded-lg bg-black border border-[#262626] p-3 text-xs font-mono text-[#ededed] overflow-auto max-h-40">
                  {resultJSON}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About JSON Path</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Extract values from deeply nested JSON using path expressions.
              Useful for debugging API responses and inspecting large payloads.
            </p>
            <p>
              <strong>Key access</strong> — <code className="text-xs text-neutral-500">name</code> or{" "}
              <code className="text-xs text-neutral-500">address.city</code>.{" "}
              <strong>Index access</strong> — <code className="text-xs text-neutral-500">users[0]</code> or{" "}
              <code className="text-xs text-neutral-500">items[0,2]</code>.{" "}
              <strong>Wildcard</strong> — <code className="text-xs text-neutral-500">items[*].id</code> all array elements.{" "}
              <strong>Slice</strong> — <code className="text-xs text-neutral-500">list[0:5]</code> first five elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
