"use client";

import { useState, useMemo, useCallback } from "react";
import { HashStraightIcon } from "@phosphor-icons/react/dist/ssr";
import { parseWithBigInt, bigIntToRadix } from "@/lib/number";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField, Select } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
import { ValueTile } from "@/components/ValueRow";

const OUTPUT_BASES = [2, 8, 10, 16];
const BASE_LABELS: Record<number, string> = { 2: "Binary", 8: "Octal", 10: "Decimal", 16: "Hexadecimal" };
const INPUT_BASES = [
  { value: 2, label: "Binary", prefix: "0b" },
  { value: 8, label: "Octal", prefix: "0o" },
  { value: 10, label: "Decimal", prefix: "" },
  { value: 16, label: "Hexadecimal", prefix: "0x" },
];

export default function NumberBasePage() {
  const [input, setInput] = useState("");
  const [inputBase, setInputBase] = useState(10);

  const value = useMemo(() => parseWithBigInt(input, inputBase), [input, inputBase]);

  const outputs = useMemo(() => {
    if (value === null) return null;
    return OUTPUT_BASES.map((b) => ({
      base: b,
      label: BASE_LABELS[b],
      value: bigIntToRadix(value, b),
    }));
  }, [value]);

  return (
    <ToolPage>
      <ToolHeader
        icon={HashStraightIcon}
        title="Number Base Converter"
        description="Convert numbers between binary, octal, decimal, and hex"
      />

      <CardStack>
        <Card label="Input">
          <div className="flex gap-2">
            <Select
              mono
              aria-label="Input base"
              value={inputBase}
              onChange={(e) => setInputBase(parseInt(e.target.value))}
              className="shrink-0"
            >
              {INPUT_BASES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} ({b.value})
                </option>
              ))}
            </Select>
            <TextField
              type="text"
              aria-label="Number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputBase === 16 ? "e.g. FF or 0xFF" : inputBase === 2 ? "e.g. 1010 or 0b1010" : "Enter a number..."}
              invalid={!!input && value === null}
            />
          </div>
          <SegmentedControl
            ariaLabel="Input base"
            mono
            value={inputBase}
            onChange={setInputBase}
            options={INPUT_BASES.map((b) => ({
              value: b.value,
              label: b.prefix ? `${b.prefix}...` : "123",
              title: b.label,
            }))}
          />
        </Card>

        {outputs && (
          <Card label="Output">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outputs.map((o) => (
                <OutputCard key={o.base} label={o.label} value={o.value} />
              ))}
            </div>
          </Card>
        )}

        <AboutCard title="About Number Base Converter">
          <p>
            Convert numbers between common radices: binary (2), octal (8),
            decimal (10), and hexadecimal (16). Supports arbitrarily large
            integers via BigInt.
          </p>
          <p>
            Use the selector or quick buttons to choose the input base.
            Prefixes <code>0b</code>,{" "}
            <code>0o</code>, and{" "}
            <code>0x</code> are detected
            automatically.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}

function OutputCard({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <ValueTile
      label={label}
      value={value}
      size="lg"
      action={<CopyButton variant="icon" copied={copied} onClick={handleCopy} label={`Copy ${label}`} />}
    />
  );
}
