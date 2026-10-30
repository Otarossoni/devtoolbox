"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import yaml from "js-yaml";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

type ConvMode = "json2yaml" | "yaml2json";

export default function JSONYamlPage() {
  const [mode, setMode] = useState<ConvMode>("json2yaml");
  const [jsonInput, setJsonInput] = useState("");
  const [yamlInput, setYamlInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentInput = mode === "json2yaml" ? jsonInput : yamlInput;

  const result = useMemo((): { output: string; error: string } => {
    if (!currentInput.trim()) return { output: "", error: "" };
    try {
      if (mode === "json2yaml") {
        const obj = JSON.parse(currentInput);
        return { output: yaml.dump(obj, { indent: 2, quotingType: '"', forceQuotes: false }) as string, error: "" };
      } else {
        const obj = yaml.load(currentInput);
        return { output: JSON.stringify(obj, null, 2), error: "" };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
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
    const ext = mode === "json2yaml" ? "yaml" : "json";
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
        title="JSON ↔ YAML"
        description="Convert between JSON and YAML formats"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "json2yaml", label: "JSON → YAML" },
            { value: "yaml2json", label: "YAML → JSON" },
          ]}
        />

        <Card label="Input">
          <TextArea
            value={currentInput}
            onChange={(e) =>
              mode === "json2yaml"
                ? setJsonInput(e.target.value)
                : setYamlInput(e.target.value)
            }
            placeholder={
              mode === "json2yaml"
                ? 'Paste JSON...\ne.g. {"key": "value"}'
                : "Paste YAML...\ne.g.\nkey: value\nlist:\n  - item1"
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

        <AboutCard title="About JSON ↔ YAML">
          <p>
            <strong>JSON → YAML</strong> — converts JSON to clean,
            indentation-based YAML format. Ideal for configuration files,
            Docker Compose, and Kubernetes manifests.
          </p>
          <p>
            <strong>YAML → JSON</strong> — parses YAML and outputs
            pretty-printed JSON with 2-space indentation. Handles nested
            objects, arrays, and common YAML syntax.
          </p>
          <p>Powered by js-yaml — all processing happens locally.</p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
