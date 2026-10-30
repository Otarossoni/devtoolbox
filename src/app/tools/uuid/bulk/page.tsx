"use client";

import { useState, useCallback } from "react";
import {
  StackIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { generateUUID, type UUIDVersion } from "@/lib/uuid";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel, CardMeta } from "@/components/Card";
import { TextField } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

const versions: { value: "v1" | "v4" | "v6" | "v7"; label: string; description: string }[] = [
  { value: "v1", label: "v1", description: "Timestamp + MAC" },
  { value: "v4", label: "v4", description: "Random" },
  { value: "v6", label: "v6", description: "Reordered timestamp" },
  { value: "v7", label: "v7", description: "Unix timestamp" },
];

export default function UUIDBulkPage() {
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [count, setCount] = useState(10);
  const [uuids, setUuids] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const arr: string[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(generateUUID(version));
    }
    setUuids(arr);
    setGenerated(true);
  }, [version, count]);

  const handleCopyAll = useCallback(async () => {
    const text = uuids.join("\n");
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
  }, [uuids]);

  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuid-${version}-${count}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids, version, count]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(uuids, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuid-${version}-${count}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids, version, count]);

  return (
    <ToolPage>
      <ToolHeader
        icon={StackIcon}
        title="Bulk UUID Generator"
        description="Generate multiple UUIDs at once"
      />

      <CardStack>
        <Card label="Options">
          <SegmentedControl
            ariaLabel="Version"
            layout="grid"
            value={version}
            onChange={(v) => {
              setVersion(v);
              setGenerated(false);
            }}
            options={versions.map((v) => ({
              value: v.value,
              label: <span className="font-mono">{v.label}</span>,
              hint: v.description,
            }))}
          />
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <FieldLabel htmlFor="bulk-count">Count</FieldLabel>
              <TextField
                id="bulk-count"
                type="number"
                value={count}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setCount(Math.max(1, Math.min(1000, v)));
                }}
                min={1}
                max={1000}
              />
            </div>
            <Button variant="primary" size="md" onClick={handleGenerate}>
              Generate
            </Button>
          </div>
        </Card>

        {generated && (
          <Card label={`${uuids.length} UUIDs`} actions={<CardMeta>{version}</CardMeta>}>
            <div className="max-h-80 overflow-auto rounded-control bg-field p-2">
              {uuids.map((id, i) => (
                <code
                  key={i}
                  className={`block rounded-inline px-2 py-1 font-mono text-[13px] select-all ${
                    i % 2 === 1 ? "bg-row-stripe" : ""
                  }`}
                >
                  <span className="mr-2 text-fg-tertiary select-none">
                    {String(i + 1).padStart(String(uuids.length).length, " ")}
                  </span>
                  <span className="text-fg">{id}</span>
                </code>
              ))}
            </div>
            <Actions>
              <CopyButton copied={copied} onClick={handleCopyAll} label="Copy All" />
              <Button icon={DownloadSimpleIcon} onClick={handleDownloadTxt}>
                .txt
              </Button>
              <Button icon={DownloadSimpleIcon} onClick={handleDownloadJson}>
                .json
              </Button>
            </Actions>
          </Card>
        )}

        <AboutCard title="About Bulk Generator">
          <p>
            Generate up to 1,000 UUIDs in a single click. Useful for test
            fixtures, database seeds, and batch processing.
          </p>
          <p>
            <strong>v4</strong> — random, the most common version.{" "}
            <strong>v7</strong> — Unix timestamp, ideal for database primary
            keys and time-based ordering.{" "}
            <strong>v1 / v6</strong> — timestamp + MAC, ordered and unique.
          </p>
          <p>
            Export as <strong>.txt</strong> (one per line) or{" "}
            <strong>.json</strong> (array). Click a UUID to manually copy or
            use <strong>Copy All</strong>.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
