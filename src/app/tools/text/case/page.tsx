"use client";

import { useState, useCallback, useMemo } from "react";
import { TextHIcon } from "@phosphor-icons/react/dist/ssr";
import { convertCase, type CaseStyle } from "@/lib/text";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, CardMeta } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

const cases: { style: CaseStyle; label: string }[] = [
  { style: "lowercase", label: "lowercase" },
  { style: "uppercase", label: "UPPERCASE" },
  { style: "title", label: "Title Case" },
  { style: "camel", label: "camelCase" },
  { style: "pascal", label: "PascalCase" },
  { style: "snake", label: "snake_case" },
  { style: "kebab", label: "kebab-case" },
  { style: "constant", label: "CONSTANT_CASE" },
];

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<CaseStyle>("lowercase");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => convertCase(input, selected), [input, selected]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
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
        icon={TextHIcon}
        title="Case Converter"
        description="Convert text between different letter cases"
      />

      <CardStack>
        <Card label="Input">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text here..."
            rows={6}
          />
          <SegmentedControl
            ariaLabel="Case"
            layout="grid"
            gridClassName="grid-cols-2 sm:grid-cols-4"
            mono
            value={selected}
            onChange={setSelected}
            options={cases.map((c) => ({ value: c.style, label: c.label }))}
          />
        </Card>

        <Card label="Output" actions={<CardMeta>{output.length} chars</CardMeta>}>
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

        <AboutCard title="About Case Conversion">
          <p>
            Convert text between common naming conventions used in programming.
            The converter detects word boundaries from spaces, hyphens, underscores,
            and camelCase transitions.
          </p>
          <p>
            <strong>lowercase</strong> — all letters lowercase.{" "}
            <strong>UPPERCASE</strong> — all letters uppercase.{" "}
            <strong>Title Case</strong> — first letter of each word capitalized.
          </p>
          <p>
            <strong>camelCase</strong> — first word lowercase, subsequent words
            capitalized. <strong>PascalCase</strong> — all words capitalized.{" "}
            <strong>snake_case</strong> — words joined by underscores.{" "}
            <strong>kebab-case</strong> — words joined by hyphens.{" "}
            <strong>CONSTANT_CASE</strong> — uppercase with underscores.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
