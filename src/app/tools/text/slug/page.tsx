"use client";

import { useState, useMemo } from "react";
import { TextAaIcon } from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField, TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

function slugify(text: string, sep: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`${escapeRegExp(sep)}+`, "g"), sep)
    .replace(new RegExp(`^${escapeRegExp(sep)}|${escapeRegExp(sep)}$`, "g"), "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Segment value for the custom separator option */
const CUSTOM = "__custom";

const SEPARATORS = [
  { value: "-", label: "Hyphen (-)" },
  { value: "_", label: "Underscore (_)" },
  { value: "~", label: "Tilde (~)" },
];

export default function TextToSlugPage() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [customSep, setCustomSep] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [copied, setCopied] = useState(false);

  const sep = useCustom && customSep ? customSep : separator;

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return slugify(input.trim(), sep);
  }, [input, sep]);

  const handleCopy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPage>
      <ToolHeader
        icon={TextAaIcon}
        title="Text to Slug"
        description="Convert text to URL-friendly slugs"
      />

      <CardStack>
        <Card label="Input">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to slugify..."
            rows={4}
          />
          <div className="flex flex-col gap-2">
            <FieldLabel>Separator</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                ariaLabel="Separator"
                mono
                value={useCustom ? CUSTOM : separator}
                onChange={(v) => {
                  if (v === CUSTOM) {
                    setUseCustom(true);
                  } else {
                    setSeparator(v);
                    setUseCustom(false);
                  }
                }}
                options={[
                  ...SEPARATORS.map((s) => ({ value: s.value, label: s.label })),
                  { value: CUSTOM, label: "Custom" },
                ]}
              />
              {useCustom && (
                <TextField
                  type="text"
                  size="sm"
                  aria-label="Custom separator"
                  value={customSep}
                  onChange={(e) => setCustomSep(e.target.value.slice(0, 3))}
                  placeholder="e.g. -"
                  className="w-20!"
                  autoFocus
                />
              )}
            </div>
          </div>
        </Card>

        {output && (
          <Card label="Output">
            <TextArea
              value={output}
              readOnly
              rows={4}
              aria-label="Output"
            />
            <Actions>
              <CopyButton copied={copied} onClick={handleCopy} />
            </Actions>
          </Card>
        )}

        <AboutCard title="About Text to Slug">
          <p>
            A slug is a URL-friendly version of a string — typically used
            for blog post URLs, CMS entries, and file names. Characters are
            lowercased, accents are removed, and everything except letters
            and digits is replaced by the chosen separator.
          </p>
          <p>
            Choose from <strong>hyphen (-)</strong>,{" "}
            <strong>underscore (_)</strong>, <strong>tilde (~)</strong>, or
            type a custom separator (up to 3 characters). Consecutive
            separators are collapsed into one, and leading/trailing
            separators are trimmed.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
