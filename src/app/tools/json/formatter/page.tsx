"use client";

import { useState, useCallback, useMemo } from "react";
import {
  BracketsCurlyIcon,
  TreeStructureIcon,
  TextAlignLeftIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatJSON, minifyJSON, highlightJSON, buildJSONTree, type JSONNode } from "@/lib/json";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
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
        {node.key !== null && (
          <span className="text-syntax-key">{node.key}</span>
        )}
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
    <ToolPage>
      <ToolHeader
        icon={BracketsCurlyIcon}
        title="JSON Formatter"
        description="Format, validate, minify, and explore JSON"
      />

      <CardStack>
        <Card
          label="Input"
          actions={
            <SegmentedControl
              ariaLabel="Output mode"
              value={outputMode}
              onChange={(m) => (m === "formatted" ? handleFormat() : handleMinify())}
              options={[
                { value: "formatted", label: "Format" },
                { value: "minified", label: "Minify" },
              ]}
            />
          }
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste JSON here... e.g. {"key": "value"}'
            rows={12}
            invalid={hasInput && !!formatted.error}
          />
        </Card>

        {hasInput && formatted.error && (
          <ErrorCard label="Error">{formatted.error}</ErrorCard>
        )}

        {hasInput && !formatted.error && (formatted.result || minified.result) && (
          <Card
            label="Output"
            actions={
              <>
                {tree && (
                  <SegmentedControl
                    ariaLabel="View"
                    value={view}
                    onChange={setView}
                    options={[
                      { value: "text", icon: TextAlignLeftIcon, title: "Text view" },
                      { value: "tree", icon: TreeStructureIcon, title: "Tree view" },
                    ]}
                  />
                )}
                <CopyButton copied={copied} onClick={handleCopy} />
              </>
            }
          >
            {view === "text" ? (
              outputMode === "formatted" && formatted.result ? (
                <CodeBlock html={highlighted} maxHeight="max-h-96" className="whitespace-pre! break-normal!" />
              ) : outputMode === "minified" && minified.result ? (
                <TextArea
                  value={minified.result}
                  readOnly
                  rows={3}
                  aria-label="Minified JSON"
                />
              ) : null
            ) : tree ? (
              <div className="max-h-96 overflow-auto rounded-control bg-field p-4">
                <TreeNode node={tree} depth={0} />
              </div>
            ) : null}
          </Card>
        )}

        <AboutCard title="About JSON Formatter">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
