"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { jsonToCSV, csvToJSON } from "@/lib/json";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

type ConvMode = "json2csv" | "csv2json";

export default function JSONConverterPage() {
  const [mode, setMode] = useState<ConvMode>("json2csv");
  const [jsonInput, setJsonInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentInput = mode === "json2csv" ? jsonInput : csvInput;

  const result = useMemo(() => {
    if (!currentInput.trim()) return { result: "", error: "" };
    return mode === "json2csv" ? jsonToCSV(currentInput) : csvToJSON(currentInput);
  }, [currentInput, mode]);

  const handleCopy = useCallback(async () => {
    if (!result.result) return;
    try {
      await navigator.clipboard.writeText(result.result);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.result]);

  const handleDownload = useCallback(() => {
    if (!result.result) return;
    const ext = mode === "json2csv" ? "csv" : "json";
    const type = mode === "json2csv" ? "text/csv" : "application/json";
    const blob = new Blob([result.result], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result.result, mode]);

  const hasOutput = !!result.result;

  return (
    <ToolPage>
      <ToolHeader
        icon={ArrowsLeftRightIcon}
        title="JSON ↔ CSV"
        description="Convert between JSON arrays and CSV format"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "json2csv", label: "JSON → CSV" },
            { value: "csv2json", label: "CSV → JSON" },
          ]}
        />

        <Card label="Input">
          <TextArea
            value={currentInput}
            onChange={(e) =>
              mode === "json2csv"
                ? setJsonInput(e.target.value)
                : setCsvInput(e.target.value)
            }
            placeholder={
              mode === "json2csv"
                ? 'Paste a JSON array of objects...\ne.g. [{"name":"Alice","age":30}]'
                : "Paste CSV data...\ne.g.\nname,age\nAlice,30\nBob,25"
            }
            rows={10}
            invalid={!!result.error}
          />
        </Card>

        {result.error && (
          <ErrorCard label="Error">{result.error}</ErrorCard>
        )}

        {hasOutput && (
          <Card label="Output">
            <TextArea
              value={result.result}
              readOnly
              rows={12}
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

        <AboutCard title="About JSON ↔ CSV">
          <p>
            <strong>JSON → CSV</strong> — converts an array of objects into
            comma-separated values. The first object determines the column
            headers. Nested objects and arrays are stringified.
          </p>
          <p>
            <strong>CSV → JSON</strong> — converts CSV data back into a JSON
            array of objects. The first row is treated as headers. All
            values are parsed as strings.
          </p>
          <p>
            CSV export handles commas, quotes, and newlines in cell values
            with proper escaping.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
