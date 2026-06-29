"use client";

import { useState, useMemo } from "react";
import { ClockIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import cronstrue from "cronstrue";

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

function validateCron(expr: string): string | null {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) return `Expected 5 fields, got ${fields.length}`;

  for (let i = 0; i < 5; i++) {
    const re = /^[*]|[0-9]+(?:-[0-9]+)?(?:\/[0-9]+)?(?:,[0-9]+(?:-[0-9]+)?(?:\/[0-9]+)?)*$/;
    if (!re.test(fields[i])) return `Invalid characters in "${fields[i]}" (field ${i + 1})`;
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
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ClockIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Cron Expression Parser</h1>
            <p className="text-sm text-neutral-500">
              Parse cron expressions into human-readable descriptions
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Expression</span>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. */15 * * * * or 0 9 * * 1-5"
              className={`flex-1 px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                input && error ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
              }`}
            />
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                copied
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
              }`}
            >
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-3 font-mono">{error}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setInput(p.value)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all duration-200 cursor-pointer border ${
                  input === p.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {description && (
          <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Description</span>
            </div>

            <p className="text-sm font-mono text-[#ededed]">{description}</p>
          </div>
        )}

        {breakdown && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Field Breakdown</span>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="px-2 py-2 text-left text-[10px] text-neutral-600 uppercase tracking-wider font-medium">Field</th>
                    <th className="px-2 py-2 text-left text-[10px] text-neutral-600 uppercase tracking-wider font-medium">Value</th>
                    <th className="px-2 py-2 text-left text-[10px] text-neutral-600 uppercase tracking-wider font-medium">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b) => (
                    <tr key={b.field} className="border-b border-[#262626]/50">
                      <td className="px-2 py-2 text-xs text-neutral-400 whitespace-nowrap">{b.field}</td>
                      <td className="px-2 py-2 text-xs font-mono text-[#8A2BE2] whitespace-nowrap">{b.value}</td>
                      <td className="px-2 py-2 text-xs text-neutral-300">{b.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {nextRuns && nextRuns.length > 0 && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Next Executions</span>
            </div>

            <div className="space-y-1.5">
              {nextRuns.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-neutral-600 w-4">{i + 1}</span>
                  <span className="text-xs font-mono text-[#ededed]">{formatDate(d)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Cron Expressions</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              A cron expression is a string of five fields separated by spaces
              that defines a schedule for recurring tasks:
            </p>

            <div className="font-mono text-xs text-[#ededed] bg-[#171717] rounded-lg p-3 border border-[#262626] space-y-0.5">
              <div className="flex gap-4 flex-wrap">
                <span className="text-[#8A2BE2]">* * * * *</span>
              </div>
              <div className="flex gap-4 flex-wrap text-neutral-500">
                <span>│ │ │ │ │</span>
              </div>
              <div className="flex gap-4 flex-wrap text-neutral-500">
                <span>│ │ │ │ └─ Day of week (0–7)</span>
              </div>
              <div className="flex gap-4 flex-wrap text-neutral-500">
                <span>│ │ │ └─── Month (1–12)</span>
              </div>
              <div className="flex gap-4 flex-wrap text-neutral-500">
                <span>│ │ └───── Day of month (1–31)</span>
              </div>
              <div className="flex gap-4 flex-wrap text-neutral-500">
                <span>│ └─────── Hour (0–23)</span>
              </div>
              <div className="flex gap-4 flex-wrap text-neutral-500">
                <span>└───────── Minute (0–59)</span>
              </div>
            </div>

            <p>
              <strong>Special characters:</strong>{" "}
              <code className="text-xs text-neutral-500">*</code> any value,{" "}
              <code className="text-xs text-neutral-500">,</code> list separator,{" "}
              <code className="text-xs text-neutral-500">-</code> range,{" "}
              <code className="text-xs text-neutral-500">/</code> step.
              Day of week: 0 and 7 both represent Sunday. If both day-of-month
              and day-of-week are specified, either match is sufficient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
