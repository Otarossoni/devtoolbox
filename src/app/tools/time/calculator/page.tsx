"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarIcon } from "@phosphor-icons/react/dist/ssr";
import {
  detectAndParse,
  addToDate,
  dateDiff,
  formatDiff,
  formatISO,
  formatUTC,
  formatLocal,
  dateToUnix,
  type TimeUnit,
} from "@/lib/time";

type CalcMode = "add" | "diff";

const units: { value: TimeUnit; label: string }[] = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function DateCalculatorPage() {
  const [mode, setMode] = useState<CalcMode>("add");

  // Add mode
  const [baseDate, setBaseDate] = useState(() => toDateTimeLocal(new Date()));
  const [amount, setAmount] = useState(30);
  const [unit, setUnit] = useState<TimeUnit>("days");

  // Diff mode
  const [dateA, setDateA] = useState(() => toDateTimeLocal(new Date()));
  const [dateB, setDateB] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return toDateTimeLocal(d);
  });

  const base = useMemo(() => detectAndParse(baseDate), [baseDate]);
  const a = useMemo(() => detectAndParse(dateA), [dateA]);
  const b = useMemo(() => detectAndParse(dateB), [dateB]);

  const addResult = useMemo(() => {
    if (!base) return null;
    const result = addToDate(base, amount, unit);
    return {
      iso: formatISO(result),
      utc: formatUTC(result),
      local: formatLocal(result),
      unix: String(dateToUnix(result).seconds),
    };
  }, [base, amount, unit]);

  const diffResult = useMemo(() => {
    if (!a || !b) return null;
    const d = dateDiff(a, b);
    return {
      diff: formatDiff(d),
      totalDays: d.totalDays.toFixed(1),
      unixDiff: String(Math.abs(b.getTime() - a.getTime()) / 1000),
    };
  }, [a, b]);

  const resetAdd = useCallback(() => {
    setBaseDate(toDateTimeLocal(new Date()));
    setAmount(30);
    setUnit("days");
  }, []);

  const resetDiff = useCallback(() => {
    setDateA(toDateTimeLocal(new Date()));
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDateB(toDateTimeLocal(d));
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <CalendarIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Date Calculator</h1>
            <p className="text-sm text-neutral-500">
              Add or subtract time, and calculate date differences
            </p>
          </div>
        </div>

        <div className="animate-5 flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setMode("add")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "add"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            Add / Subtract
          </button>
          <button
            onClick={() => setMode("diff")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "diff"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            Difference
          </button>
        </div>

        {mode === "add" ? (
          <>
            <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Operation
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex-1">
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                    Base date
                  </label>
                  <input
                    type="datetime-local"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as TimeUnit)}
                    className="px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={resetAdd}
                  className="px-3 py-1.5 rounded-md text-xs bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer"
                >
                  Reset to now
                </button>
              </div>
            </div>

            {addResult && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Result
                  </span>
                </div>

                <div className="space-y-2">
                  <ResultRow label="Local" value={addResult.local} />
                  <ResultRow label="UTC" value={addResult.utc} />
                  <ResultRow label="ISO 8601 (UTC)" value={addResult.iso} />
                  <ResultRow label="Unix" value={addResult.unix} />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Dates
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                    Date A
                  </label>
                  <input
                    type="datetime-local"
                    value={dateA}
                    onChange={(e) => setDateA(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                    Date B
                  </label>
                  <input
                    type="datetime-local"
                    value={dateB}
                    onChange={(e) => setDateB(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={resetDiff}
                  className="px-3 py-1.5 rounded-md text-xs bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {diffResult && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Difference
                  </span>
                </div>

                <p className="text-2xl font-mono font-semibold text-[#8A2BE2] mb-4">
                  {diffResult.diff}
                </p>

                <div className="space-y-2">
                  <ResultRow label="Total days" value={diffResult.totalDays} />
                  <ResultRow label="Unix diff" value={`${diffResult.unixDiff}s`} />
                </div>
              </div>
            )}
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Date Calculator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              <strong>Add / Subtract</strong> — add or subtract any amount of
              time from a base date. Useful for calculating deadlines, expiry
              dates, and future events.
            </p>
            <p>
              <strong>Difference</strong> — calculate the exact interval between
              two dates, broken down into years, months, days, hours, minutes,
              and seconds. Ideal for age calculation or time tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <span className="text-xs text-neutral-500">{label}</span>
      <code className="text-sm font-mono text-[#ededed]">{value}</code>
    </div>
  );
}
