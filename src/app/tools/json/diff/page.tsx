"use client";

import { useState, useMemo } from "react";
import { GitDiffIcon } from "@phosphor-icons/react/dist/ssr";
import { diffJSON, type DiffNode, type DiffType } from "@/lib/json";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextArea } from "@/components/Field";
import Button from "@/components/Button";
import { Actions } from "@/components/Output";

const TYPE_COLORS: Record<DiffType, string> = {
  same: "text-fg",
  added: "text-success",
  removed: "text-error",
  changed: "text-warning",
};

function DiffTreeNode({ node, depth }: { node: DiffNode; depth: number }) {
  const hasChildren = node.children.length > 0;

  if (!hasChildren) {
    const prefix = node.type === "added" ? "+ " : node.type === "removed" ? "- " : "  ";
    const color = TYPE_COLORS[node.type];
    const val = node.type === "added" ? node.newValue : node.type === "removed" ? node.oldValue : node.type === "changed" ? `${node.oldValue} → ${node.newValue}` : node.oldValue;
    return (
      <div className="font-mono text-[13px] leading-5" style={{ paddingLeft: depth * 16 }}>
        <span className="text-fg-secondary w-6 inline-block">{prefix}</span>
        {node.key !== null && <span className="text-syntax-key">{node.key}</span>}
        {node.key !== null && <span className="text-fg-tertiary">: </span>}
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
        {node.key !== null && <span className="text-syntax-key">{node.key}</span>}
        {node.key !== null && <span className="text-fg-tertiary">: </span>}
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
    <ToolPage>
      <ToolHeader
        icon={GitDiffIcon}
        title="JSON Diff"
        description="Compare two JSON objects and find differences"
      />

      <CardStack>
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex min-h-5 items-center justify-between">
                <FieldLabel htmlFor="json-diff-left">Original</FieldLabel>
                {left && (leftParsed ? <span className="text-xs text-success">✓</span> : <span className="text-xs text-error">✗</span>)}
              </div>
              <TextArea
                id="json-diff-left"
                value={left}
                onChange={(e) => { setLeft(e.target.value); setCompared(false); }}
                placeholder='{"name": "Alice"}'
                rows={10}
                spellCheck={false}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex min-h-5 items-center justify-between">
                <FieldLabel htmlFor="json-diff-right">Modified</FieldLabel>
                {right && (rightParsed ? <span className="text-xs text-success">✓</span> : <span className="text-xs text-error">✗</span>)}
              </div>
              <TextArea
                id="json-diff-right"
                value={right}
                onChange={(e) => { setRight(e.target.value); setCompared(false); }}
                placeholder='{"name": "Bob"}'
                rows={10}
                spellCheck={false}
              />
            </div>
          </div>
          <Actions align="center">
            <Button
              variant="primary"
              size="md"
              icon={GitDiffIcon}
              onClick={handleCompare}
              disabled={!leftParsed || !rightParsed}
            >
              Compare
            </Button>
          </Actions>
        </Card>

        {compared && diff && (
          <Card label="Diff">
            <div className="max-h-96 overflow-auto rounded-control bg-field p-4">
              <DiffTreeNode node={diff} depth={0} />
            </div>
          </Card>
        )}

        <AboutCard title="About JSON Diff">
          <p>
            Compare two JSON objects side by side. Differences are shown
            as a tree with color-coded changes.
          </p>
          <p>
            <span className="text-success">Green</span> — added keys.{" "}
            <span className="text-error">Red</span> — removed keys.{" "}
            <span className="text-warning">Amber</span> — changed values.
            Unchanged keys are left in the default color.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
