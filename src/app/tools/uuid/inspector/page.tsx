"use client";

import { useState, useMemo } from "react";
import {
  FingerprintSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  isValidUUID,
  detectUUIDVersion,
  getUUIDVariant,
  extractUUIDTimestamp,
  extractUUIDNode,
  extractUUIDClockSeq,
  isNilUUID,
  uuidToHexBytes,
  type UUIDVersion,
} from "@/lib/uuid";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField, FieldError } from "@/components/Field";
import { ValueRow, Badge } from "@/components/ValueRow";

const STRUCTURE_COLORS = [
  "bg-data-1/15 text-data-1",
  "bg-data-2/15 text-data-2",
  "bg-data-3/15 text-data-3",
  "bg-data-4/15 text-data-4",
  "bg-data-5/15 text-data-5",
];

const groups = (uuid: string) => {
  const clean = uuid.replace(/-/g, "");
  return [
    clean.slice(0, 8),
    clean.slice(8, 12),
    clean.slice(12, 16),
    clean.slice(16, 20),
    clean.slice(20, 32),
  ];
};

const groupLabels = (version: UUIDVersion | null) => {
  if (version === "v1" || version === "v6") {
    return version === "v6"
      ? ["time_high", "time_mid", "ver + time_low", "var + clk_seq", "node"]
      : ["time_low", "time_mid", "ver + time_hi", "var + clk_seq", "node"];
  }
  return ["field 0", "field 1", "ver + field 2", "var + field 3", "field 4"];
};

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export default function UUIDInspectorPage() {
  const [input, setInput] = useState("");

  const valid = useMemo(() => isValidUUID(input.trim()), [input]);
  const version = useMemo(() => detectUUIDVersion(input.trim()), [input]);
  const nil = useMemo(() => isNilUUID(input.trim()), [input]);
  const variant = useMemo(
    () => (valid ? getUUIDVariant(input.trim()) : null),
    [input, valid],
  );
  const timestamp = useMemo(
    () => (valid && version ? extractUUIDTimestamp(input.trim(), version) : null),
    [input, valid, version],
  );
  const node = useMemo(
    () => (valid ? extractUUIDNode(input.trim()) : null),
    [input, valid],
  );
  const clockSeq = useMemo(
    () => (valid ? extractUUIDClockSeq(input.trim()) : null),
    [input, valid],
  );
  const hexBytes = useMemo(
    () => (valid ? uuidToHexBytes(input.trim()) : ""),
    [input, valid],
  );

  const hasInput = input.trim().length > 0;
  const grp = groups(input.trim());

  return (
    <ToolPage>
      <ToolHeader
        icon={FingerprintSimpleIcon}
        title="UUID Inspector"
        description="Decode and analyze any UUID"
      />

      <CardStack>
        <Card label="UUID">
          <TextField
            type="text"
            aria-label="UUID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a UUID..."
            invalid={hasInput && !valid}
          />
          {hasInput && !valid && (
            <FieldError>Invalid UUID format</FieldError>
          )}
        </Card>

        {hasInput && valid && (
          <>
            <Card label="Summary">
              <code className="block font-mono text-base break-all text-fg select-all">
                {input.trim()}
              </code>
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">Valid</Badge>
                {version && <Badge tone="accent" mono>{version}</Badge>}
                {variant && <Badge>{variant}</Badge>}
                {nil && <Badge>Nil UUID</Badge>}
              </div>
            </Card>

            {(version === "v1" || version === "v6" || version === "v7") &&
              timestamp && (
                <Card label="Timestamp">
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-lg text-fg">
                      {formatDate(timestamp.date)}
                    </p>
                    <p className="text-xs text-fg-tertiary">
                      {version === "v7"
                        ? `Unix ms: ${timestamp.ts.toLocaleString()}`
                        : `Unix ms: ${timestamp.ts.toLocaleString()}  ·  100-ns intervals since 1582-10-15`}
                    </p>
                  </div>
                </Card>
              )}

            <Card label="Structure">
              <div className="flex flex-wrap items-center gap-1 font-mono text-base sm:text-lg">
                {grp.map((g, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="mx-0.5 text-fg-tertiary">-</span>
                    )}
                    <span
                      className={`rounded-inline px-1.5 py-0.5 ${STRUCTURE_COLORS[i]}`}
                    >
                      {g}
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {groupLabels(version).map((label, i) => (
                  <div
                    key={i}
                    className={`flex h-7 items-center gap-1.5 rounded-segment px-2.5 font-mono text-xs ${STRUCTURE_COLORS[i]}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </Card>

            <Card label="Raw bytes">
              <code className="block font-mono text-sm break-all text-fg select-all">
                {hexBytes}
              </code>
            </Card>

            {(version === "v1" || version === "v6") && (
              <Card label="Details">
                <div className="space-y-2">
                  {clockSeq !== null && (
                    <ValueRow label="Clock sequence" value={clockSeq.toLocaleString()} />
                  )}
                  {node && (
                    <ValueRow label="Node" value={node} />
                  )}
                </div>
              </Card>
            )}
          </>
        )}

        <AboutCard title="About UUID Inspector">
          <p>
            Paste any UUID to decode its internal structure. The inspector
            shows the version, variant, raw bytes, and extracts timestamps
            for time-based UUIDs.
          </p>
          <p>
            <strong>v1 / v6</strong> — timestamp (100-ns intervals since
            1582), clock sequence, and MAC address.{" "}
            <strong>v7</strong> — Unix timestamp in milliseconds.
          </p>
          <p>
            <strong>v3 / v5</strong> — hash-based, the version and variant
            are detected but no embedded data can be extracted.{" "}
            <strong>v4</strong> — random, no embedded information.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
