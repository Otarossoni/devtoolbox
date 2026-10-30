"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { evaluateJSONPath, buildJSONTree, formatJSON, type JSONNode } from "@/lib/json";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard, FieldLabel } from "@/components/Card";
import { TextArea } from "@/components/Field";
import { CodeBlock } from "@/components/Output";

const TYPE_COLORS: Record<string, string> = {
  string: "text-syntax-string",
  number: "text-syntax-number",
  boolean: "text-syntax-number",
  null: "text-fg-tertiary",
  object: "text-syntax-key",
  array: "text-syntax-key",
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
            aria-expanded={open}
            aria-label={open ? "Collapse" : "Expand"}
            className="w-4 shrink-0 cursor-pointer text-center text-fg-tertiary hover:text-fg"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {node.key !== null && <span className="text-syntax-key">{node.key}</span>}
        {node.key !== null && <span className="text-fg-tertiary">: </span>}
        {hasChildren ? (
          open ? (
            <span className="text-fg-secondary">{bracket![0]}</span>
          ) : (
            <span className="text-fg-secondary">{node.value}</span>
          )
        ) : (
          <span className={TYPE_COLORS[node.type] ?? ""}>{node.value}</span>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-2">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
          <div className="flex" style={{ paddingLeft: depth * 16 }}>
            <span className="text-fg-secondary">{bracket![1]}</span>
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
    <ToolPage>
      <ToolHeader
        icon={MagnifyingGlassIcon}
        title="JSON Path"
        description="Extract values from JSON using path expressions"
      />

      <CardStack>
        <Card
          label="JSON Input"
          actions={
            hasJSON ? (parsed ? <span className="text-xs text-success">✓</span> : <span className="text-xs text-error">✗</span>) : undefined
          }
        >
          <TextArea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste JSON here... e.g. {"store":{"books":[{"title":"A"},{"title":"B"}]}}'
            rows={8}
          />
        </Card>

        <Card label="Path">
          <div className="flex h-control items-center gap-1 rounded-control bg-field px-4 font-mono text-base has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-accent sm:text-sm">
            <span className="text-fg-secondary">$.</span>
            <input
              type="text"
              aria-label="Path"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder="store.books[0].title"
              className="min-w-0 flex-1 bg-transparent text-fg placeholder:text-fg-tertiary focus-visible:outline-none"
            />
          </div>
          <p className="text-xs text-fg-tertiary [&_code]:font-mono [&_code]:text-fg-secondary">
            <span className="mr-1">Examples:</span>
            <code>name</code>
            <span className="mx-1">·</span>
            <code>users[0].email</code>
            <span className="mx-1">·</span>
            <code>items[*].id</code>
            <span className="mx-1">·</span>
            <code>list[0:3]</code>
          </p>
        </Card>

        {result?.error && (
          <ErrorCard label="Error">{result.error}</ErrorCard>
        )}

        {result && !result.error && resultTree && (
          <Card label="Result">
            <div className="max-h-80 overflow-auto rounded-control bg-field p-4">
              <TreeNode node={resultTree} depth={0} />
            </div>
            {resultJSON && (
              <div className="flex flex-col gap-2">
                <FieldLabel>Raw JSON</FieldLabel>
                <CodeBlock tone="primary" maxHeight="max-h-40" className="whitespace-pre! break-normal!">
                  {resultJSON}
                </CodeBlock>
              </div>
            )}
          </Card>
        )}

        <AboutCard title="About JSON Path">
          <p>
            Extract values from deeply nested JSON using path expressions.
            Useful for debugging API responses and inspecting large payloads.
          </p>
          <p>
            <strong>Key access</strong> — <code>name</code> or{" "}
            <code>address.city</code>.{" "}
            <strong>Index access</strong> — <code>users[0]</code> or{" "}
            <code>items[0,2]</code>.{" "}
            <strong>Wildcard</strong> — <code>items[*].id</code> all array elements.{" "}
            <strong>Slice</strong> — <code>list[0:5]</code> first five elements.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
