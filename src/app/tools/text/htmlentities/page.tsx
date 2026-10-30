"use client";

import { useState, useMemo, useCallback } from "react";
import { BracketsAngleIcon } from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import { ToggleChip } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

type EncMode = "encode" | "decode";

function encodeEntities(text: string, encodeNonAscii: boolean): string {
  let result = text.replace(/&/g, "&amp;");
  result = result.replace(/</g, "&lt;");
  result = result.replace(/>/g, "&gt;");
  result = result.replace(/"/g, "&quot;");
  result = result.replace(/'/g, "&#39;");

  if (encodeNonAscii) {
    result = result.replace(/[^\x00-\x7F]/gu, (ch) => {
      return `&#x${ch.codePointAt(0)?.toString(16).toUpperCase()};`;
    });
  }

  return result;
}

function decodeEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export default function HtmlEntitiesPage() {
  const [mode, setMode] = useState<EncMode>("encode");
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [copied, setCopied] = useState(false);

  const input = mode === "encode" ? encodeInput : decodeInput;

  const output = useMemo(() => {
    if (!(mode === "encode" ? encodeInput : decodeInput).trim()) return "";
    try {
      return mode === "encode"
        ? encodeEntities(encodeInput, encodeNonAscii)
        : decodeEntities(decodeInput);
    } catch {
      return "";
    }
  }, [mode, encodeInput, decodeInput, encodeNonAscii]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <ToolPage>
      <ToolHeader
        icon={BracketsAngleIcon}
        title="HTML Entities"
        description="Encode and decode HTML entities"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />

        <Card
          label="Input"
          actions={
            mode === "encode" ? (
              <ToggleChip
                mono
                pressed={encodeNonAscii}
                onClick={() => setEncodeNonAscii(!encodeNonAscii)}
              >
                {encodeNonAscii ? "Emoji → hex" : "Emoji as-is"}
              </ToggleChip>
            ) : undefined
          }
        >
          <TextArea
            value={input}
            onChange={(e) => {
              if (mode === "encode") setEncodeInput(e.target.value);
              else setDecodeInput(e.target.value);
            }}
            placeholder={
              mode === "encode"
                ? "Type HTML to encode...\ne.g. <div>Hello & welcome</div>"
                : "Paste HTML entities to decode...\ne.g. &lt;div&gt;Hello &amp; welcome&lt;/div&gt;"
            }
            rows={6}
          />
        </Card>

        {output && (
          <Card label="Output">
            <TextArea
              value={output}
              readOnly
              rows={6}
              aria-label="Output"
            />
            <Actions>
              <CopyButton copied={copied} onClick={handleCopy} />
            </Actions>
          </Card>
        )}

        <AboutCard title="About HTML Entities">
          <p>
            HTML entities allow you to safely represent reserved characters
            in HTML. For example, <code>&lt;</code>{" "}
            is represented as <code>&amp;lt;</code>{" "}
            to avoid being interpreted as a tag opener.
          </p>
          <p>
            <strong>Encode</strong> replaces <code>&amp;</code>{" "}
            (first), <code>&lt;</code>,{" "}
            <code>&gt;</code>,{" "}
            <code>&quot;</code>, and{" "}
            <code>&#39;</code>. Toggle
            &ldquo;Emoji → hex&rdquo; to also convert non-ASCII characters
            like 😀 into <code>&amp;#x1F600;</code>.
          </p>
          <p>
            <strong>Decode</strong> uses the browser&rsquo;s native HTML
            parser to safely decode all named and numeric entities back to
            their original characters.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
