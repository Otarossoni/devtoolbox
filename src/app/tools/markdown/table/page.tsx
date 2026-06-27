"use client";

import { useState, useCallback } from "react";
import {
  TableIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";

type Alignment = "left" | "center" | "right";

const PRESETS = [
  { cols: 3, rows: 3, label: "3×3" },
  { cols: 4, rows: 4, label: "4×4" },
  { cols: 5, rows: 4, label: "5×4" },
];

function generateMarkdown(cells: string[][], alignments: Alignment[]): string {
  const lines: string[] = [];

  lines.push("| " + cells[0].map((c) => c || " ").join(" | ") + " |");

  lines.push(
    "| " +
      alignments
        .map((a) => {
          if (a === "center") return ":---:";
          if (a === "right") return "---:";
          return "---";
        })
        .join(" | ") +
      " |",
  );

  for (let r = 1; r < cells.length; r++) {
    lines.push("| " + cells[r].map((c) => c || " ").join(" | ") + " |");
  }

  return lines.join("\n");
}

export default function MarkdownTablePage() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [cells, setCells] = useState<string[][]>(() =>
    Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => (r === 0 ? `Header ${c + 1}` : `Cell ${r}-${c + 1}`)),
    ),
  );
  const [alignments, setAlignments] = useState<Alignment[]>(() => Array(3).fill("left"));
  const [copied, setCopied] = useState(false);

  const output = generateMarkdown(cells, alignments);

  const rebuildGrid = useCallback(
    (newCols: number, newRows: number) => {
      setCols(newCols);
      setRows(newRows);
      setCells(
        Array.from({ length: newRows }, (_, r) =>
          Array.from({ length: newCols }, (_, c) => {
            const old = cells[r]?.[c];
            return old ?? (r === 0 ? `Header ${c + 1}` : "");
          }),
        ),
      );
      setAlignments((prev) => {
        if (newCols <= prev.length) return prev.slice(0, newCols);
        return [...prev, ...Array(newCols - prev.length).fill("left")];
      });
    },
    [cells],
  );

  const toggleAlign = useCallback((ci: number) => {
    setAlignments((prev) => {
      const next = [...prev];
      if (next[ci] === "left") next[ci] = "center";
      else if (next[ci] === "center") next[ci] = "right";
      else next[ci] = "left";
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <TableIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Table Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate and edit Markdown tables
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Size</span>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Columns</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => rebuildGrid(Math.max(1, parseInt(e.target.value) || 1), rows)}
                min={1}
                max={10}
                className="w-20 px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Rows</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => rebuildGrid(cols, Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-20 px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            </div>
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => rebuildGrid(p.cols, p.rows)}
                  className="px-3 py-2 rounded-lg text-xs font-mono bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Content</span>
            <span className="text-[10px] text-neutral-600">
              Click header to toggle alignment
            </span>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {cells[0]?.map((_, ci) => (
                    <th key={ci} className="px-3 py-2 text-left">
                      <button
                        onClick={() => toggleAlign(ci)}
                        className="text-[10px] font-mono text-neutral-500 hover:text-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                      >
                        {alignments[ci] === "left" ? "←" : alignments[ci] === "center" ? "↔" : "→"}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-1 py-1">
                        <input
                          value={cell}
                          onChange={(e) => {
                            const next = cells.map((r) => [...r]);
                            next[ri][ci] = e.target.value;
                            setCells(next);
                          }}
                          placeholder={ri === 0 ? `Header ${ci + 1}` : ""}
                          className={`w-full px-2 py-1.5 rounded-md border text-xs font-mono outline-none transition-colors duration-200 ${
                            ri === 0
                              ? "bg-[#171717] border-[#262626] text-neutral-300"
                              : "bg-black border-[#262626] text-[#ededed] placeholder:text-neutral-600"
                          } focus:border-[#8A2BE2]`}
                          style={{ textAlign: alignments[ci] }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Output</span>
          </div>

          <textarea
            value={output}
            readOnly
            rows={rows + 2}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none resize-none"
          />

          <div className="flex items-center justify-end mt-4">
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

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Table Generator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Generate properly formatted Markdown tables with editable cells
              and column alignment. Click the arrows in each header to toggle
              between left, center, and right alignment.
            </p>
            <p>
              Use the Column and Row inputs to resize the grid, or click a
              preset for common sizes. The output updates live and can be
              copied directly into any Markdown document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
