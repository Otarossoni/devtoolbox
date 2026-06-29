"use client";

import { useState, useMemo, useCallback } from "react";
import { HashStraightIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { parseWithBigInt, bigIntToRadix } from "@/lib/number";

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
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <HashStraightIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Number Base Converter</h1>
            <p className="text-sm text-neutral-500">
              Convert numbers between binary, octal, decimal, and hex
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
          </div>

          <div className="flex gap-2">
            <select
              value={inputBase}
              onChange={(e) => setInputBase(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200 cursor-pointer"
            >
              {INPUT_BASES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} ({b.value})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputBase === 16 ? "e.g. FF or 0xFF" : inputBase === 2 ? "e.g. 1010 or 0b1010" : "Enter a number..."}
              className={`flex-1 px-4 py-2 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                input && value === null ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {INPUT_BASES.map((b) => (
              <button
                key={b.value}
                onClick={() => setInputBase(b.value)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all duration-200 cursor-pointer border ${
                  inputBase === b.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-500 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {b.prefix ? `${b.prefix}...` : "123"}
              </button>
            ))}
          </div>
        </div>

        {outputs && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Output</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outputs.map((o) => (
                <OutputCard key={o.base} label={o.label} value={o.value} />
              ))}
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Number Base Converter</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Convert numbers between common radices: binary (2), octal (8),
              decimal (10), and hexadecimal (16). Supports arbitrarily large
              integers via BigInt.
            </p>
            <p>
              Use the selector or quick buttons to choose the input base.
              Prefixes <code className="text-xs text-neutral-500">0b</code>,{" "}
              <code className="text-xs text-neutral-500">0o</code>, and{" "}
              <code className="text-xs text-neutral-500">0x</code> are detected
              automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
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
    <div className="p-4 rounded-lg bg-[#171717] border border-[#262626]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</span>
        <button
          onClick={handleCopy}
          className={`shrink-0 p-1 rounded transition-colors duration-200 cursor-pointer ${copied ? "text-green-400" : "text-neutral-600 hover:text-[#8A2BE2]"}`}
        >
          {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
        </button>
      </div>
      <code className="block text-lg font-mono text-[#ededed] break-all">{value}</code>
    </div>
  );
}
