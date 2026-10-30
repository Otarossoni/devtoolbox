"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { jsonToXML, xmlToJSON } from "@/lib/json";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

type ConvMode = "json2xml" | "xml2json";

export default function JSONXMLPage() {
  const [mode, setMode] = useState<ConvMode>("json2xml");
  const [jsonInput, setJsonInput] = useState("");
  const [xmlInput, setXmlInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentInput = mode === "json2xml" ? jsonInput : xmlInput;

  const result = useMemo((): { output: string; error: string } => {
    if (!currentInput.trim()) return { output: "", error: "" };
    const r = mode === "json2xml"
      ? jsonToXML(currentInput)
      : xmlToJSON(currentInput);
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

  const handleDownload = useCallback(() => {
    if (!result.output) return;
    const ext = mode === "json2xml" ? "xml" : "json";
    const type = "text/plain";
    const blob = new Blob([result.output], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result.output, mode]);

  return (
    <ToolPage>
      <ToolHeader
        icon={ArrowsLeftRightIcon}
        title="JSON ↔ XML"
        description="Convert between JSON and XML formats"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "json2xml", label: "JSON → XML" },
            { value: "xml2json", label: "XML → JSON" },
          ]}
        />

        <Card label="Input">
          <TextArea
            value={currentInput}
            onChange={(e) =>
              mode === "json2xml"
                ? setJsonInput(e.target.value)
                : setXmlInput(e.target.value)
            }
            placeholder={
              mode === "json2xml"
                ? 'Paste JSON...\ne.g. {"name":"Alice"} or [{"id":1}]'
                : "Paste XML...\ne.g.\n<person><name>Alice</name><age>30</age></person>"
            }
            rows={12}
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
              rows={14}
              aria-label="Output"
            />
            <Actions>
              <CopyButton copied={copied} onClick={handleCopy} />
              <Button icon={DownloadSimpleIcon} onClick={handleDownload}>
                Download
              </Button>
            </Actions>
          </Card>
        )}

        <AboutCard title="About JSON ↔ XML">
          <p>
            <strong>JSON → XML</strong> — converts any JSON object or array into
            well-formatted XML with 2-space indentation. Arrays and
            multi-key objects are auto-wrapped in a <code>&lt;root&gt;</code>{" "}
            element. Use <code>@key</code> for attributes.
          </p>
          <p>
            <strong>XML → JSON</strong> — parses XML into a JSON object
            using the browser&rsquo;s native DOMParser. Repeated elements
            become arrays, attributes get an <code>@</code>{" "}
            prefix.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
