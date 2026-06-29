"use client";

import { useState, useMemo } from "react";
import { TableIcon, CopyIcon, CheckIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

interface AsciiEntry {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  char: string;
  name: string;
  entity: string;
  category: "control" | "digit" | "upper" | "lower" | "punct" | "printable";
}

const NAMES: Record<number, string> = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "TAB", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN",
  23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS",
  30: "RS", 31: "US", 32: "SPACE", 127: "DEL",
};

const ENTITIES: Record<number, string> = {
  34: "&quot;", 38: "&amp;", 39: "&#39;", 60: "&lt;", 62: "&gt;",
};

function getCategory(dec: number): AsciiEntry["category"] {
  if (dec <= 31 || dec === 127) return "control";
  if (dec >= 48 && dec <= 57) return "digit";
  if (dec >= 65 && dec <= 90) return "upper";
  if (dec >= 97 && dec <= 122) return "lower";
  if (dec < 48 || (dec > 57 && dec < 65) || (dec > 90 && dec < 97) || (dec > 122 && dec < 127)) return "punct";
  return "printable";
}

function toBin(dec: number): string {
  return dec.toString(2).padStart(8, "0");
}

const DATA: AsciiEntry[] = Array.from({ length: 128 }, (_, dec) => {
  const isControl = dec <= 31 || dec === 127;
  return {
    dec,
    hex: dec.toString(16).toUpperCase().padStart(2, "0"),
    oct: dec.toString(8).padStart(3, "0"),
    bin: toBin(dec),
    char: isControl ? "" : String.fromCharCode(dec),
    name: NAMES[dec] ?? "",
    entity: ENTITIES[dec] ?? (isControl ? "" : `&#${dec};`),
    category: getCategory(dec),
  };
});

const ROWS = 8;
const COLS = 16;

function cellBg(entry: AsciiEntry, selected: boolean, matched: boolean): string {
  if (selected) return "bg-[#8A2BE2] text-white";
  if (matched) return "bg-[#8A2BE2]/20 text-[#ededed]";
  switch (entry.category) {
    case "control": return "bg-[#171717] text-neutral-600";
    case "digit":
    case "upper":
    case "lower": return "bg-[#0a0a0a] text-[#8A2BE2]";
    default: return "bg-[#0a0a0a] text-neutral-400";
  }
}

const ROW_LABELS = Array.from({ length: 8 }, (_, i) => `0x${(i * 16).toString(16).toUpperCase()}_`);
const COL_LABELS = Array.from({ length: 16 }, (_, i) => i.toString(16).toUpperCase());

export default function AsciiTablePage() {
  const [selected, setSelected] = useState<AsciiEntry | null>(null);
  const [search, setSearch] = useState("");

  const matchedDecs = useMemo(() => {
    if (!search.trim()) return new Set<number>();
    const q = search.toLowerCase();
    const set = new Set<number>();
    for (const e of DATA) {
      if (
        e.char.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.dec.toString().includes(q) ||
        e.hex.toLowerCase().includes(q) ||
        toBin(e.dec).includes(q)
      ) {
        set.add(e.dec);
      }
    }
    return set;
  }, [search]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <TableIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ASCII Table</h1>
            <p className="text-sm text-neutral-500">
              Interactive ASCII reference table (0–127)
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by char, hex, decimal, name, or entity..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-600 hover:text-[#ededed] transition-colors cursor-pointer"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="h-3 w-3 rounded-sm bg-[#171717]" />
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Control</span>
            <span className="h-3 w-3 rounded-sm bg-[#0a0a0a]" />
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Punctuation</span>
            <span className="h-3 w-3 rounded-sm bg-[#8A2BE2]/40" />
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Letters & Digits</span>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="pb-1 pr-2" />
                  {COL_LABELS.map((h) => (
                    <th key={h} className="pb-1 px-0.5 text-center text-[10px] font-mono text-neutral-600 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ROWS }, (_, row) => (
                  <tr key={row}>
                    <td className="pr-2 text-[10px] font-mono text-neutral-600 text-right whitespace-nowrap">
                      {ROW_LABELS[row]}
                    </td>
                    {Array.from({ length: COLS }, (_, col) => {
                      const entry = DATA[row * COLS + col];
                      const isSelected = selected?.dec === entry.dec;
                      const isMatched = matchedDecs.has(entry.dec);
                      const display = entry.category === "control"
                        ? (entry.name || "&nbsp;")
                        : entry.char;
                      return (
                        <td key={col} className="p-0">
                          <button
                            onClick={() => setSelected(isSelected ? null : entry)}
                            className={`w-full aspect-[1.4] flex items-center justify-center text-xs font-mono rounded cursor-pointer transition-all duration-150 border border-transparent hover:border-[#3a3a3a] ${
                              cellBg(entry, isSelected, isMatched)
                            }`}
                          >
                            {display}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono text-[#ededed]">
                  {selected.category === "control" ? selected.name : selected.char}
                </span>
                {selected.category !== "control" && (
                  <span className="text-sm text-neutral-500">U+{selected.hex.padStart(4, "0")}</span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <DetailCard label="Decimal" value={selected.dec.toString()} />
              <DetailCard label="Hex" value={`0x${selected.hex}`} />
              <DetailCard label="Octal" value={`0o${selected.oct}`} />
              <DetailCard label="Binary" value={selected.bin} spaced />
              {selected.name && <DetailCard label="Name" value={selected.name} />}
              {selected.entity && <DetailCard label="HTML Entity" value={selected.entity} />}
              {selected.category === "control" && (
                <DetailCard label="Escape" value={`\\x${selected.hex}`} />
              )}
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About ASCII Table</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              The American Standard Code for Information Interchange (ASCII)
              defines 128 characters (0–127). The first 32 (0–31) and 127 (DEL)
              are <strong>control characters</strong> used for communication
              protocols, terminals, and printers.
            </p>
            <p>
              <strong>32–126</strong> are printable characters: space,
              punctuation, digits (0–9), uppercase letters (A–Z), and lowercase
              letters (a–z). Each cell shows the actual character (or control
              code abbreviation for non-printables).
            </p>
            <p>
              Click any cell to see full details: decimal, hexadecimal, octal,
              8-bit binary, name, and HTML entity. Use the search bar to filter
              by character, code, name, or entity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, spaced = false }: { label: string; value: string; spaced?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <code className={`block text-sm font-mono text-[#ededed] break-all ${spaced ? "tracking-[0.15em]" : ""}`}>
        {value}
      </code>
    </div>
  );
}
