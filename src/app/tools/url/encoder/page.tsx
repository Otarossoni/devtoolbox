"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import { ToggleChip } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

type EncMode = "encode" | "decode";

export default function URLEncoderPage() {
  const [mode, setMode] = useState<EncMode>("encode");
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encodeAll, setEncodeAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const input = mode === "encode" ? encodeInput : decodeInput;

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return mode === "encode"
        ? encodeAll
          ? encodeURIComponent(input)
          : encodeURI(input)
        : encodeAll
          ? decodeURIComponent(input)
          : decodeURI(input);
    } catch {
      return mode === "encode" ? "" : "Invalid encoded string";
    }
  }, [input, mode, encodeAll]);

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
        icon={ArrowsLeftRightIcon}
        title="URL Encoder / Decoder"
        description="Encode and decode URL components"
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
            <ToggleChip mono pressed={encodeAll} onClick={() => setEncodeAll(!encodeAll)}>
              {encodeAll ? "Full" : "URL-safe"}
            </ToggleChip>
          }
        >
          <TextArea
            value={input}
            onChange={(e) =>
              mode === "encode"
                ? setEncodeInput(e.target.value)
                : setDecodeInput(e.target.value)
            }
            placeholder={
              mode === "encode"
                ? "Type text to encode...\ne.g. hello world & more"
                : "Paste encoded string to decode...\ne.g. hello%20world%20%26%20more"
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

        <AboutCard title="About URL Encoding">
          <p>
            <strong>Full</strong> — uses <code>encodeURIComponent</code>, encodes all special
            characters including slashes and ampersands. Ideal for query
            string values and form data.
          </p>
          <p>
            <strong>URL-safe</strong> — uses <code>encodeURI</code>, preserves URL structure
            characters like <code>/ ? & #</code>. Useful when you want
            a readable URL with special characters only in the query values.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
