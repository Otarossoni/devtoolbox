"use client";

import { useState, useMemo, useCallback } from "react";
import { BinaryIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { parseWithBigInt, bitwiseCalc, bigIntToRadix, bigIntToBitString, formatBinary, type BitwiseOp } from "@/lib/number";

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
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <BinaryIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bitwise Calculator</h1>
            <p className="text-sm text-neutral-500">
              Perform bitwise operations and visualize binary data
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">A</label>
              <div className="flex gap-2">
                <select
                  value={baseA}
                  onChange={(e) => setBaseA(parseInt(e.target.value))}
                  className="px-2 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                >
                  {BASES.map((b) => (
                    <option key={b} value={b}>{BASE_LABELS[b]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder="e.g. 255"
                  className={`flex-1 px-3 py-2 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                    a && valA === null ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">B</label>
              <div className="flex gap-2">
                <select
                  value={baseB}
                  onChange={(e) => setBaseB(parseInt(e.target.value))}
                  className="px-2 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                >
                  {BASES.map((b) => (
                    <option key={b} value={b}>{BASE_LABELS[b]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  placeholder="e.g. 15"
                  className={`flex-1 px-3 py-2 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                    b && valB === null ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {OPS.map((o) => (
              <button
                key={o.op}
                onClick={() => setOp(o.op)}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer border ${
                  op === o.op
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {o.label} <span className="text-neutral-600">{o.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {result !== null && resultOutputs && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Result</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {resultOutputs.map((o) => (
                <ResultCard key={o.base} label={o.label} value={o.value} />
              ))}
            </div>

            {(bitsA || bitsB || bitsR) && (
              <>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3">32-bit visualization</div>
                <div className="space-y-2">
                  {bitsA && <BitRow label="A" bits={bitsA} />}
                  {bitsB && <BitRow label="B" bits={bitsB} />}
                  <div className="border-b border-[#262626] my-1" />
                  {bitsR && <BitRow label="R" bits={bitsR} highlight />}
                </div>
              </>
            )}
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Bitwise Calculator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
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
          </div>
        </div>
      </div>
    </div>
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
    <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</span>
        <button
          onClick={handleCopy}
          className={`shrink-0 p-0.5 rounded transition-colors duration-200 cursor-pointer ${copied ? "text-green-400" : "text-neutral-600 hover:text-[#8A2BE2]"}`}
        >
          {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
        </button>
      </div>
      <code className="block text-sm font-mono text-[#ededed] break-all">{value}</code>
    </div>
  );
}

function BitRow({ label, bits, highlight = false }: { label: string; bits: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-neutral-500 w-4">{label}</span>
      <div className="flex gap-1">
        {bits.split(" ").map((nibble, gi) => (
          <div key={gi} className="flex gap-px">
            {nibble.split("").map((bit, bi) => (
              <span
                key={bi}
                className={`inline-block w-3 h-4 rounded-sm ${
                  bit === "1"
                    ? highlight ? "bg-[#8A2BE2]" : "bg-[#8A2BE2]/60"
                    : "bg-[#262626]"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
