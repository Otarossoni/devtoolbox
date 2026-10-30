"use client";

import { useState, useCallback } from "react";
import {
  TableIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel, CardMeta } from "@/components/Card";
import { TextField, TextArea } from "@/components/Field";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

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
    <ToolPage>
      <ToolHeader
        icon={TableIcon}
        title="Table Generator"
        description="Generate and edit Markdown tables"
      />

      <CardStack>
        <Card label="Size">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="table-cols">Columns</FieldLabel>
              <TextField
                id="table-cols"
                type="number"
                value={cols}
                onChange={(e) => rebuildGrid(Math.max(1, parseInt(e.target.value) || 1), rows)}
                min={1}
                max={10}
                className="w-24!"
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="table-rows">Rows</FieldLabel>
              <TextField
                id="table-rows"
                type="number"
                value={rows}
                onChange={(e) => rebuildGrid(cols, Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-24!"
              />
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  onClick={() => rebuildGrid(p.cols, p.rows)}
                  className="font-mono"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card
          label="Content"
          actions={<CardMeta>Click header to toggle alignment</CardMeta>}
        >
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {cells[0]?.map((_, ci) => (
                    <th key={ci} className="px-1 pb-1 text-left">
                      <button
                        onClick={() => toggleAlign(ci)}
                        aria-label={`Column ${ci + 1} alignment: ${alignments[ci]}`}
                        className="hit-area pressable h-control-sm min-w-control-sm cursor-pointer rounded-segment px-2 font-mono text-sm text-fg-secondary transition-colors hover:bg-surface-elevated hover:text-accent-text"
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
                          aria-label={ri === 0 ? `Header ${ci + 1}` : `Row ${ri}, column ${ci + 1}`}
                          onChange={(e) => {
                            const next = cells.map((r) => [...r]);
                            next[ri][ci] = e.target.value;
                            setCells(next);
                          }}
                          placeholder={ri === 0 ? `Header ${ci + 1}` : ""}
                          className={`h-control-sm w-full min-w-20 rounded-segment px-2.5 font-mono text-[13px] placeholder:text-fg-tertiary ${
                            ri === 0
                              ? "bg-surface-elevated font-medium text-fg"
                              : "bg-field text-fg"
                          }`}
                          style={{ textAlign: alignments[ci] }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card label="Output">
          <TextArea
            value={output}
            readOnly
            rows={rows + 2}
            aria-label="Markdown output"
          />
          <Actions>
            <CopyButton copied={copied} onClick={handleCopy} />
          </Actions>
        </Card>

        <AboutCard title="About Table Generator">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
