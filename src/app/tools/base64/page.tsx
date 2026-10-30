"use client";

import { useState, useCallback, useMemo } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
} from "@phosphor-icons/react/dist/ssr";
import { encodeBase64, decodeBase64, isValidBase64 } from "@/lib/base64";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
import { OutputBox, OutputValue, OutputPlaceholder, Actions } from "@/components/Output";

type Mode = "encode" | "decode";

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [copied, setCopied] = useState(false);

  const input = mode === "encode" ? encodeInput : decodeInput;

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: false };
    if (mode === "encode") return { output: encodeBase64(input), error: false };
    return isValidBase64(input)
      ? { output: decodeBase64(input), error: false }
      : { output: input, error: true };
  }, [mode, input]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (mode === "encode") setEncodeInput(e.target.value);
      else setDecodeInput(e.target.value);
    },
    [mode],
  );

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output || error) return;
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
  }, [output, error]);

  const hasInput = input.trim().length > 0;

  return (
    <ToolPage>
      <ToolHeader
        icon={LockKeyIcon}
        title="Base64"
        description="Encode text to Base64 and decode it back"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={handleModeChange}
          options={[
            { value: "encode", label: "Encode", icon: LockKeyIcon },
            { value: "decode", label: "Decode", icon: LockKeyOpenIcon },
          ]}
        />

        <Card label="Input">
          <TextArea
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === "encode"
                ? "Type or paste text to encode..."
                : "Paste a Base64 string to decode..."
            }
            rows={4}
          />

          <FieldLabel>Result</FieldLabel>

          <OutputBox tone={error ? "error" : "default"}>
            {!hasInput ? (
              <OutputPlaceholder>
                {mode === "encode"
                  ? "Encoded result will appear here"
                  : "Decoded result will appear here"}
              </OutputPlaceholder>
            ) : error ? (
              <span className="text-sm text-error">
                Invalid Base64 string
              </span>
            ) : (
              <OutputValue>{output}</OutputValue>
            )}
          </OutputBox>

          <Actions>
            <CopyButton
              copied={copied}
              onClick={handleCopy}
              disabled={!output || error}
            />
          </Actions>
        </Card>

        <AboutCard title="About Base64">
          <p>
            Base64 is a binary-to-text encoding scheme that represents binary
            data in an ASCII string format using a set of 64 characters
            (A-Z, a-z, 0-9, +, /).
          </p>
          <p>
            It is commonly used to encode binary data for transmission over
            text-based protocols such as HTTP, email (MIME), and JSON
            (data URLs). Every 3 bytes of binary data are represented as
            4 Base64 characters.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
