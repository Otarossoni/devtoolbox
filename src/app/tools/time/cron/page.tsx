"use client";

import { useState, useMemo } from "react";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import cronstrue from "cronstrue";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField, FieldError } from "@/components/Field";
import { ToggleChip } from "@/components/Button";
import CopyButton from "@/components/CopyButton";

const FIELD_NAMES = ["Minute", "Hour", "Day of month", "Month", "Day of week"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PRESETS: { label: string; value: string }[] = [
  { label: "@hourly", value: "0 * * * *" },
  { label: "Every 15 min", value: "*/15 * * * *" },
  { label: "Every 30 min", value: "*/30 * * * *" },
  { label: "@daily", value: "0 0 * * *" },
  { label: "@weekly", value: "0 0 * * 0" },
  { label: "@monthly", value: "0 0 1 * *" },
  { label: "@yearly", value: "0 0 1 1 *" },
  { label: "Weekdays 9am", value: "0 9 * * 1-5" },
];

function matchesField(value: number, field: string, min: number): boolean {
  if (field === "*") return true;

  const parts = field.split(",");

  for (const part of parts) {
    let step = 1;
    let range = part;

    const slashIdx = part.indexOf("/");
    if (slashIdx !== -1) {
      step = parseInt(part.slice(slashIdx + 1), 10);
      range = part.slice(0, slashIdx);
    }

    // Truncated day-of-week (7 = Sunday = 0)
    const normalized = value === 7 ? 0 : value;

    if (range === "*") {
      if ((normalized - min) % step === 0) return true;
    } else if (range.includes("-")) {
      const [lo, hi] = range.split("-").map(Number);
      const check = normalized;
      if (check >= Math.min(lo, hi) && check <= Math.max(lo, hi) && (check - lo) % step === 0) return true;
    } else {
      const n = parseInt(range, 10);
      const check = normalized;
      if (check === n) return true;
      // Also check day-of-week 7 == 0
      if (n === 7 && check === 0) return true;
      if (n === 0 && check === 7) return true;
    }
  }

  return false;
}

function fieldBreakdown(field: string, fieldIdx: number): string {
  if (field === "*") return fieldIdx === 4 ? "every day" : "every";
  const parts = field.split(",").map((p) => {
    const slash = p.indexOf("/");
    const step = slash !== -1 ? ` every ${p.slice(slash + 1)}` : "";
    const range = slash !== -1 ? p.slice(0, slash) : p;

    if (range === "*") return `every${step}`;

    if (range.includes("-")) {
      const [lo, hi] = range.split("-").map(Number);
      const loLabel = fieldIdx === 4 ? WEEKDAYS[lo] : fieldIdx === 3 ? MONTHS[lo] : lo;
      const hiLabel = fieldIdx === 4 ? WEEKDAYS[hi] : fieldIdx === 3 ? MONTHS[hi] : hi;
      return `${loLabel} through ${hiLabel}${step}`;
    }

    const n = parseInt(range, 10);
    return fieldIdx === 4 ? WEEKDAYS[n] : fieldIdx === 3 ? MONTHS[n] : String(n);
  });

  return parts.join(", ");
}

/** Allowed [min, max] per field: minute, hour, day of month, month, day of week (0 and 7 = Sunday) */
const FIELD_RANGES: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

function validateCron(expr: string): string | null {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) return `Expected 5 fields, got ${fields.length}`;

  for (let i = 0; i < 5; i++) {
    const re = /^(?:\*|\d+(?:-\d+)?)(?:\/\d+)?(?:,(?:\*|\d+(?:-\d+)?)(?:\/\d+)?)*$/;
    if (!re.test(fields[i])) return `Invalid characters in "${fields[i]}" (field ${i + 1})`;

    const [min, max] = FIELD_RANGES[i];
    for (const part of fields[i].split(",")) {
      const [range, step] = part.split("/");
      if (step !== undefined && parseInt(step, 10) < 1) return `Step must be at least 1 in "${part}" (${FIELD_NAMES[i]})`;
      if (range === "*") continue;
      const [lo, hi = lo] = range.split("-").map(Number);
      if (lo < min || hi > max) return `${FIELD_NAMES[i]} must be between ${min} and ${max}, got "${range}"`;
      if (lo > hi) return `Invalid range "${range}" (${FIELD_NAMES[i]})`;
    }
  }
  return null;
}

function getNextExecutions(expr: string, count: number = 5): Date[] {
  const fields = expr.trim().split(/\s+/);
  const results: Date[] = [];
  const now = new Date();
  now.setSeconds(0, 0);

  let candidate = new Date(now.getTime() + 60 * 1000);
  const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  while (results.length < count && candidate <= maxDate) {
    const m = candidate.getMinutes();
    const h = candidate.getHours();
    const dom = candidate.getDate();
    const month = candidate.getMonth() + 1;
    const dow = candidate.getDay();

    const domMatch = fields[2] !== "*" || fields[4] === "*";
    const dowMatch = fields[4] !== "*" || fields[2] === "*";

    const minuteOk = matchesField(m, fields[0], 0);
    const hourOk = matchesField(h, fields[1], 0);
    const domOk = domMatch ? matchesField(dom, fields[2], 1) : true;
    const monthOk = matchesField(month, fields[3], 1);
    const dowOk = dowMatch ? matchesField(dow, fields[4], 0) : true;

    if (minuteOk && hourOk && domOk && monthOk && dowOk) {
      results.push(new Date(candidate));
    }

    candidate = new Date(candidate.getTime() + 60 * 1000);
  }

  return results;
}

function formatDate(d: Date): string {
  const month = MONTHS[d.getMonth() + 1];
  const day = d.getDate();
  const year = d.getFullYear();
  const hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${month} ${day}, ${year}, ${h12}:${minute} ${ampm}`;
}

export default function CronParserPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const fields = useMemo(() => input.trim().split(/\s+/), [input]);

  const error = useMemo(() => validateCron(input), [input]);
  const valid = fields.length === 5 && !error;

  const description = useMemo(() => {
    if (!valid) return null;
    try {
      return cronstrue.toString(input.trim(), { throwExceptionOnParseError: false });
    } catch {
      return null;
    }
  }, [input, valid]);

  const nextRuns = useMemo(() => {
    if (!valid) return null;
    try {
      return getNextExecutions(input.trim());
    } catch {
      return null;
    }
  }, [input, valid]);

  const breakdown = useMemo(() => {
    if (!valid) return null;
    return fields.map((f, i) => ({
      field: FIELD_NAMES[i],
      value: f,
      meaning: fieldBreakdown(f, i),
    }));
  }, [fields, valid]);

  const handleCopy = async () => {
    if (!input) return;
    try { await navigator.clipboard.writeText(input); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPage>
      <ToolHeader
        icon={ClockIcon}
        title="Cron Expression Parser"
        description="Parse cron expressions into human-readable descriptions"
      />

      <CardStack>
        <Card label="Expression">
          <div className="flex gap-2">
            <TextField
              type="text"
              aria-label="Cron expression"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. */15 * * * * or 0 9 * * 1-5"
              invalid={!!input && !!error}
            />
            <CopyButton
              variant="icon"
              copied={copied}
              onClick={handleCopy}
              className="size-control! rounded-control! bg-surface-elevated"
            />
          </div>
          {error && (
            <FieldError className="font-mono">{error}</FieldError>
          )}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <ToggleChip
                key={p.value}
                mono
                pressed={input === p.value}
                onClick={() => setInput(p.value)}
              >
                {p.label}
              </ToggleChip>
            ))}
          </div>
        </Card>

        {description && (
          <Card label="Description">
            <p className="font-mono text-sm text-fg">{description}</p>
          </Card>
        )}

        {breakdown && (
          <Card label="Field Breakdown">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="px-2.5 pb-2 text-left text-xs font-semibold text-fg-tertiary">Field</th>
                    <th className="px-2.5 pb-2 text-left text-xs font-semibold text-fg-tertiary">Value</th>
                    <th className="px-2.5 pb-2 text-left text-xs font-semibold text-fg-tertiary">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b) => (
                    <tr key={b.field} className="even:bg-row-stripe">
                      <td className="h-control rounded-l-segment px-2.5 text-[13px] whitespace-nowrap text-fg-secondary">{b.field}</td>
                      <td className="px-2.5 font-mono text-[13px] whitespace-nowrap text-accent">{b.value}</td>
                      <td className="rounded-r-segment px-2.5 text-[13px] text-fg">{b.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {nextRuns && nextRuns.length > 0 && (
          <Card label="Next Executions">
            <div className="space-y-1.5">
              {nextRuns.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-4 font-mono text-xs text-fg-tertiary">{i + 1}</span>
                  <span className="font-mono text-[13px] text-fg">{formatDate(d)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <AboutCard title="About Cron Expressions">
          <p>
            A cron expression is a string of five fields separated by spaces
            that defines a schedule for recurring tasks:
          </p>
          <div className="space-y-0.5 overflow-x-auto rounded-control bg-field p-3 font-mono text-xs text-fg-secondary">
            <div className="flex flex-wrap gap-4">
              <span className="text-accent">* * * * *</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>│ │ │ │ │</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>│ │ │ │ └─ Day of week (0–7)</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>│ │ │ └─── Month (1–12)</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>│ │ └───── Day of month (1–31)</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>│ └─────── Hour (0–23)</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>└───────── Minute (0–59)</span>
            </div>
          </div>
          <p>
            <strong>Special characters:</strong>{" "}
            <code>*</code> any value,{" "}
            <code>,</code> list separator,{" "}
            <code>-</code> range,{" "}
            <code>/</code> step.
            Day of week: 0 and 7 both represent Sunday. If both day-of-month
            and day-of-week are specified, either match is sufficient.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
