"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import {
  detectAndParse,
  dateToUnix,
  formatISO,
  formatUTC,
  formatLocal,
  formatRelative,
} from "@/lib/time";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, CardMeta } from "@/components/Card";
import { TextField, FieldError } from "@/components/Field";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { ValueRow } from "@/components/ValueRow";

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <ValueRow
      label={label}
      value={value}
      action={<CopyButton variant="icon" copied={copied} onClick={handleCopy} label={`Copy ${label}`} />}
    />
  );
}

export default function TimestampPage() {
  const [input, setInput] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const date = useMemo(() => detectAndParse(input), [input]);
  const live = useMemo(() => dateToUnix(new Date(now)), [now]);

  const result = useMemo(() => {
    if (!date) return null;
    const unix = dateToUnix(date);
    return {
      unixS: String(unix.seconds),
      unixMs: String(unix.milliseconds),
      iso: formatISO(date),
      utc: formatUTC(date),
      local: formatLocal(date),
      relative: formatRelative(date),
    };
  }, [date]);

  return (
    <ToolPage>
      <ToolHeader
        icon={ClockIcon}
        title="Timestamp Converter"
        description="Convert between Unix timestamps and human-readable dates"
      />

      <CardStack>
        <Card label="Live" actions={<CardMeta>updates every second</CardMeta>}>
          <div className="flex min-h-control flex-wrap items-center justify-between gap-2 rounded-control bg-field px-4 py-2">
            <code className="font-mono text-sm text-fg">
              Unix: {live.seconds.toLocaleString()}
            </code>
            <code className="font-mono text-xs text-fg-secondary">
              {formatUTC(new Date(now))}
            </code>
          </div>
        </Card>

        <Card label="Input">
          <div className="flex gap-2">
            <TextField
              type="text"
              aria-label="Timestamp or date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Unix timestamp, ISO 8601, date..."
              invalid={!!input && !date}
            />
            <Button
              size="md"
              onClick={() => {
                setInput(String(dateToUnix(new Date()).seconds));
              }}
            >
              Now
            </Button>
          </div>
          {input && !date && (
            <FieldError>
              Unrecognized format — try a Unix timestamp, ISO 8601, or a readable date
            </FieldError>
          )}
        </Card>

        {result && (
          <Card label="Output">
            <div className="space-y-2">
              <Row label="Unix (s)" value={result.unixS} />
              <Row label="Unix (ms)" value={result.unixMs} />
              <Row label="ISO 8601" value={result.iso} />
              <Row label="UTC" value={result.utc} />
              <Row label="Local" value={result.local} />
              <Row label="Relative" value={result.relative} />
            </div>
          </Card>
        )}

        <AboutCard title="About Timestamps">
          <p>
            Paste any timestamp or date to see all formats at once. Auto-detects
            Unix seconds, Unix milliseconds, ISO 8601, and common date strings.
          </p>
          <p>
            <strong>Unix (s)</strong> — seconds since 1970-01-01 UTC.{" "}
            <strong>Unix (ms)</strong> — same in milliseconds, used in JavaScript.{" "}
            <strong>ISO 8601</strong> — international standard, UTC by default.
          </p>
          <p>
            <strong>Relative</strong> — human-friendly elapsed time.{" "}
            <strong>Live clock</strong> — current Unix timestamp updating
            every second for reference.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
