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
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField, Select } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import { Actions } from "@/components/Output";
import { ValueRow } from "@/components/ValueRow";

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
    <ToolPage>
      <ToolHeader
        icon={CalendarIcon}
        title="Date Calculator"
        description="Add or subtract time, and calculate date differences"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "add", label: "Add / Subtract" },
            { value: "diff", label: "Difference" },
          ]}
        />

        {mode === "add" ? (
          <>
            <Card label="Operation">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel htmlFor="calc-base">Base date</FieldLabel>
                  <TextField
                    id="calc-base"
                    type="datetime-local"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="scheme-dark"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:w-28">
                  <FieldLabel htmlFor="calc-amount">Amount</FieldLabel>
                  <TextField
                    id="calc-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="calc-unit">Unit</FieldLabel>
                  <Select
                    id="calc-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as TimeUnit)}
                  >
                    {units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <Actions>
                <Button onClick={resetAdd}>
                  Reset to now
                </Button>
              </Actions>
            </Card>

            {addResult && (
              <Card label="Result">
                <div className="space-y-2">
                  <ResultRow label="Local" value={addResult.local} />
                  <ResultRow label="UTC" value={addResult.utc} />
                  <ResultRow label="ISO 8601 (UTC)" value={addResult.iso} />
                  <ResultRow label="Unix" value={addResult.unix} />
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card label="Dates">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="calc-date-a">Date A</FieldLabel>
                  <TextField
                    id="calc-date-a"
                    type="datetime-local"
                    value={dateA}
                    onChange={(e) => setDateA(e.target.value)}
                    className="scheme-dark"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="calc-date-b">Date B</FieldLabel>
                  <TextField
                    id="calc-date-b"
                    type="datetime-local"
                    value={dateB}
                    onChange={(e) => setDateB(e.target.value)}
                    className="scheme-dark"
                  />
                </div>
              </div>
              <Actions>
                <Button onClick={resetDiff}>
                  Reset
                </Button>
              </Actions>
            </Card>

            {diffResult && (
              <Card label="Difference">
                <p className="font-mono text-2xl font-semibold text-accent">
                  {diffResult.diff}
                </p>
                <div className="space-y-2">
                  <ResultRow label="Total days" value={diffResult.totalDays} />
                  <ResultRow label="Unix diff" value={`${diffResult.unixDiff}s`} />
                </div>
              </Card>
            )}
          </>
        )}

        <AboutCard title="About Date Calculator">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return <ValueRow label={label} value={value} />;
}
