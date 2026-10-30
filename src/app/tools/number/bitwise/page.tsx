"use client";

import { useState, useMemo, useCallback } from "react";
import { BinaryIcon } from "@phosphor-icons/react/dist/ssr";
import { parseWithBigInt, bitwiseCalc, bigIntToRadix, bigIntToBitString, formatBinary, type BitwiseOp } from "@/lib/number";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField, Select } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";
import { ValueTile } from "@/components/ValueRow";

const BASES = [2, 8, 10, 16];
const BASE_LABELS: Record<number, string> = { 2: "Bin", 8: "Oct", 10: "Dec", 16: "Hex" };

const OPS: { op: BitwiseOp; label: string; symbol: string }[] = [
  { op: "AND", label: "AND", symbol: "&" },
  { op: "OR", label: "OR", symbol: "|" },
  { op: "XOR", label: "XOR", symbol: "^" },
  { op: "NOT", label: "NOT", symbol: "~" },
  { op: "LSHIFT", label: "<<", symbol: "<<" },
  { op: "RSHIFT", label: ">>", symbol: ">>" },
];

export default function BitwiseCalculatorPage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [baseA, setBaseA] = useState(10);
  const [baseB, setBaseB] = useState(10);
  const [op, setOp] = useState<BitwiseOp>("AND");

  const valA = useMemo(() => parseWithBigInt(a, baseA), [a, baseA]);
  const valB = useMemo(() => parseWithBigInt(b, baseB), [b, baseB]);
  const result = useMemo(() => {
    if (valA === null || valB === null) return null;
    try { return bitwiseCalc(valA, valB, op); } catch { return null; }
  }, [valA, valB, op]);

  const resultOutputs = useMemo(() => {
    if (result === null) return null;
    return BASES.map((b) => ({
      base: b,
      label: BASE_LABELS[b],
      value: bigIntToRadix(result, b),
    }));
  }, [result]);

  const bitsA = useMemo(() => (valA !== null ? formatBinary(bigIntToBitString(valA, 32)) : ""), [valA]);
  const bitsB = useMemo(() => (valB !== null ? formatBinary(bigIntToBitString(valB, 32)) : ""), [valB]);
  const bitsR = useMemo(() => (result !== null ? formatBinary(bigIntToBitString(result, 32)) : ""), [result]);

  return (
    <ToolPage>
      <ToolHeader
        icon={BinaryIcon}
        title="Bitwise Calculator"
        description="Perform bitwise operations and visualize binary data"
      />

      <CardStack>
        <Card label="Input">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="bitwise-a">A</FieldLabel>
              <div className="flex gap-2">
                <Select
                  mono
                  aria-label="Base of A"
                  value={baseA}
                  onChange={(e) => setBaseA(parseInt(e.target.value))}
                  className="shrink-0"
                >
                  {BASES.map((b) => (
                    <option key={b} value={b}>{BASE_LABELS[b]}</option>
                  ))}
                </Select>
                <TextField
                  id="bitwise-a"
                  type="text"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder="e.g. 255"
                  invalid={!!a && valA === null}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="bitwise-b">B</FieldLabel>
              <div className="flex gap-2">
                <Select
                  mono
                  aria-label="Base of B"
                  value={baseB}
                  onChange={(e) => setBaseB(parseInt(e.target.value))}
                  className="shrink-0"
                >
                  {BASES.map((b) => (
                    <option key={b} value={b}>{BASE_LABELS[b]}</option>
                  ))}
                </Select>
                <TextField
                  id="bitwise-b"
                  type="text"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  placeholder="e.g. 15"
                  invalid={!!b && valB === null}
                />
              </div>
            </div>
          </div>

          <SegmentedControl
            ariaLabel="Operation"
            mono
            value={op}
            onChange={setOp}
            options={OPS.map((o) => ({
              value: o.op,
              label: (
                <>
                  {o.label} <span className="text-fg-secondary">{o.symbol}</span>
                </>
              ),
            }))}
          />
        </Card>

        {result !== null && resultOutputs && (
          <Card label="Result">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {resultOutputs.map((o) => (
                <ResultCard key={o.base} label={o.label} value={o.value} />
              ))}
            </div>

            {(bitsA || bitsB || bitsR) && (
              <>
                <FieldLabel>32-bit visualization</FieldLabel>
                <div className="space-y-2 overflow-x-auto">
                  {bitsA && <BitRow label="A" bits={bitsA} />}
                  {bitsB && <BitRow label="B" bits={bitsB} />}
                  <div className="h-1" />
                  {bitsR && <BitRow label="R" bits={bitsR} highlight />}
                </div>
              </>
            )}
          </Card>
        )}

        <AboutCard title="About Bitwise Calculator">
          <p>
            Perform bitwise operations on integer values. Supports AND (&amp;),
            OR (|), XOR (^), NOT (~), left shift (&lt;&lt;), and right shift (&gt;&gt;).
            All operations use BigInt for arbitrary precision.
          </p>
          <p>
            The 32-bit visualization shows each number as a row of bits,
            grouped into nibbles (4-bit groups). Purple cells represent 1,
            dark cells represent 0. The result row is highlighted.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
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
      action={<CopyButton variant="icon" copied={copied} onClick={handleCopy} label={`Copy ${label}`} />}
    />
  );
}

function BitRow({ label, bits, highlight = false }: { label: string; bits: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 font-mono text-xs text-fg-secondary">{label}</span>
      <div className="flex gap-1">
        {bits.split(" ").map((nibble, gi) => (
          <div key={gi} className="flex gap-px">
            {nibble.split("").map((bit, bi) => (
              <span
                key={bi}
                className={`inline-block h-4 w-3 rounded-[3px] ${
                  bit === "1"
                    ? highlight ? "bg-accent" : "bg-accent/60"
                    : "bg-surface-elevated"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
