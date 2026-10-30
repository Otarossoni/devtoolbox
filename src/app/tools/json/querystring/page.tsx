"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { jsonToQueryString, queryStringToJSON } from "@/lib/json";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

type ConvMode = "json2qs" | "qs2json";

export default function JSONQueryStringPage() {
  const [mode, setMode] = useState<ConvMode>("json2qs");
  const [jsonInput, setJsonInput] = useState("");
  const [qsInput, setQsInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentInput = mode === "json2qs" ? jsonInput : qsInput;

  const result = useMemo((): { output: string; error: string } => {
    if (!currentInput.trim()) return { output: "", error: "" };
    const r = mode === "json2qs"
      ? jsonToQueryString(currentInput)
      : queryStringToJSON(currentInput);
    return { output: r.result, error: r.error || "" };
  }, [currentInput, mode]);

  const handleCopy = useCallback(async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.output]);

  return (
    <ToolPage>
      <ToolHeader
        icon={ArrowsLeftRightIcon}
        title="JSON ↔ Query String"
        description="Convert between JSON objects and URL query strings"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "json2qs", label: "JSON → QS" },
            { value: "qs2json", label: "QS → JSON" },
          ]}
        />

        <Card label="Input">
          <TextArea
            value={currentInput}
            onChange={(e) =>
              mode === "json2qs"
                ? setJsonInput(e.target.value)
                : setQsInput(e.target.value)
            }
            placeholder={
              mode === "json2qs"
                ? 'Paste a JSON object...\ne.g. {"name":"Alice","age":30}'
                : "Paste a URL or query string...\ne.g. name=Alice&age=30 or ?name=Alice&age=30"
            }
            rows={8}
            invalid={!!result.error}
          />
        </Card>

        {result.error && (
          <ErrorCard label="Error">{result.error}</ErrorCard>
        )}

        {result.output && (
          <Card label="Output">
            <TextArea
              value={result.output}
              readOnly
              rows={8}
              aria-label="Output"
            />
            <Actions>
              <CopyButton copied={copied} onClick={handleCopy} />
            </Actions>
          </Card>
        )}

        <AboutCard title="About JSON ↔ Query String">
          <p>
            <strong>JSON → QS</strong> — converts a flat or nested JSON
            object into a URL-encoded query string. Arrays use{" "}
            <code>key[]</code> notation,
            nested objects use <code>key[sub]</code>.
          </p>
          <p>
            <strong>QS → JSON</strong> — parses a query string back into a
            JSON object. Paste a full URL (with{" "}
            <code>?</code>) or just the
            query string portion. Supports nested keys and array notation.
          </p>
          <p>
            Powered by the browser&rsquo;s native URLSearchParams API.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
