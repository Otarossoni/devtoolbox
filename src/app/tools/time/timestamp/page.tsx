"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ClockIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import {
  detectAndParse,
  dateToUnix,
  formatISO,
  formatUTC,
  formatLocal,
  formatRelative,
} from "@/lib/time";

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
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <span className="text-xs text-neutral-500 min-w-20">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-sm font-mono text-[#ededed] text-right">
          {value}
        </code>
        <button
          onClick={handleCopy}
          className={`shrink-0 p-1 rounded transition-colors duration-200 cursor-pointer ${
            copied ? "text-green-400" : "text-neutral-600 hover:text-[#8A2BE2]"
          }`}
        >
          {copied ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
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
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ClockIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Timestamp Converter</h1>
            <p className="text-sm text-neutral-500">
              Convert between Unix timestamps and human-readable dates
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Live
            </span>
            <span className="text-xs text-neutral-600">updates every second</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-[#262626]">
            <code className="text-sm font-mono text-[#ededed]">
              Unix: {live.seconds.toLocaleString()}
            </code>
            <code className="text-xs font-mono text-neutral-500">
              {formatUTC(new Date(now))}
            </code>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Input
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Unix timestamp, ISO 8601, date..."
              className={`flex-1 px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                input && !date
                  ? "border-red-500/50"
                  : input && date
                    ? "border-green-500/50"
                    : "border-[#262626] focus:border-[#8A2BE2]"
              }`}
            />
            <button
              onClick={() => {
                setInput(String(dateToUnix(new Date()).seconds));
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer"
            >
              Now
            </button>
          </div>

          {input && !date && (
            <p className="text-xs text-red-400 mt-2">
              Unrecognized format — try a Unix timestamp, ISO 8601, or a readable date
            </p>
          )}
        </div>

        {result && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Output
              </span>
            </div>

            <div className="space-y-2">
              <Row label="Unix (s)" value={result.unixS} />
              <Row label="Unix (ms)" value={result.unixMs} />
              <Row label="ISO 8601" value={result.iso} />
              <Row label="UTC" value={result.utc} />
              <Row label="Local" value={result.local} />
              <Row label="Relative" value={result.relative} />
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Timestamps</h2>
          <div className="space-y-3 text-sm text-neutral-400">
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
          </div>
        </div>
      </div>
    </div>
  );
}
