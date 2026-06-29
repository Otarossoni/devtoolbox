"use client";

import { useState, useMemo, useCallback } from "react";
import { TableIcon, CopyIcon, CheckIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

interface AsciiEntry {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  char: string;
  code: string;
  description: string;
  entity: string;
  category: "control" | "digit" | "upper" | "lower" | "symbol" | "space";
}

const CONTROL_DESCRIPTIONS: Record<number, string> = {
  0: "Null character", 1: "Start of heading", 2: "Start of text", 3: "End of text",
  4: "End of transmission", 5: "Enquiry", 6: "Acknowledge", 7: "Bell / Alert",
  8: "Backspace", 9: "Horizontal tab", 10: "Line feed / Newline", 11: "Vertical tab",
  12: "Form feed", 13: "Carriage return", 14: "Shift out", 15: "Shift in",
  16: "Data link escape", 17: "Device control 1", 18: "Device control 2", 19: "Device control 3",
  20: "Device control 4", 21: "Negative acknowledge", 22: "Synchronous idle",
  23: "End of transmission block", 24: "Cancel", 25: "End of medium",
  26: "Substitute", 27: "Escape", 28: "File separator", 29: "Group separator",
  30: "Record separator", 31: "Unit separator", 32: "Space",
  127: "Delete",
};

const SYMBOL_NAMES: Record<number, string> = {
  33: "Exclamation mark", 34: "Double quote", 35: "Hash / Pound", 36: "Dollar sign",
  37: "Percent sign", 38: "Ampersand", 39: "Single quote", 40: "Left parenthesis",
  41: "Right parenthesis", 42: "Asterisk / Star", 43: "Plus sign", 44: "Comma",
  45: "Hyphen / Minus", 46: "Period / Dot", 47: "Slash / Forward slash",
  58: "Colon", 59: "Semicolon", 60: "Less than", 61: "Equals sign",
  62: "Greater than", 63: "Question mark", 64: "At sign",
  91: "Left square bracket", 92: "Backslash", 93: "Right square bracket",
  94: "Caret / Circumflex", 95: "Underscore", 96: "Backtick / Grave accent",
  123: "Left curly brace", 124: "Vertical bar / Pipe", 125: "Right curly brace",
  126: "Tilde",
};

const NAMES: Record<number, string> = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "TAB", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN",
  23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS",
  30: "RS", 31: "US", 127: "DEL",
};

const ENTITIES: Record<number, string> = {
  34: "&quot;", 38: "&amp;", 39: "&#39;", 60: "&lt;", 62: "&gt;",
  160: "&nbsp;",
};

function getCategory(dec: number): AsciiEntry["category"] {
  if (dec === 32) return "space";
  if (dec <= 31 || dec === 127) return "control";
  if (dec >= 48 && dec <= 57) return "digit";
  if (dec >= 65 && dec <= 90) return "upper";
  if (dec >= 97 && dec <= 122) return "lower";
  return "symbol";
}

function toBin(dec: number): string {
  return dec.toString(2).padStart(8, "0");
}

const DATA: AsciiEntry[] = Array.from({ length: 128 }, (_, dec) => {
  const isControl = dec <= 31 || dec === 127;
  const codeName = NAMES[dec] ?? "";
  const description = CONTROL_DESCRIPTIONS[dec] ?? SYMBOL_NAMES[dec] ?? "";
  return {
    dec,
    hex: dec.toString(16).toUpperCase(),
    oct: dec.toString(8),
    bin: toBin(dec),
    char: String.fromCharCode(dec),
    code: codeName,
    description,
    entity: ENTITIES[dec] ?? (isControl ? "" : `&#${dec};`),
    category: getCategory(dec),
  };
});

const COLS = 16;
const COL_LABELS = Array.from({ length: COLS }, (_, i) => i.toString(16).toUpperCase());

function cellBg(cat: AsciiEntry["category"], selected: boolean, matched: boolean): string {
  if (selected) return "bg-[#8A2BE2] text-white";
  if (matched) return "bg-[#8A2BE2]/20 text-[#ededed]";
  switch (cat) {
    case "control": return "bg-[#171717] text-neutral-600";
    case "space": return "bg-[#141414] text-neutral-500";
    case "symbol": return "bg-[#0f0f0f] text-neutral-400";
    case "digit": return "bg-[#0f0f0f] text-green-400";
    case "upper": return "bg-[#0f0f0f] text-[#8A2BE2]";
    case "lower": return "bg-[#0f0f0f] text-sky-400";
  }
}

export default function AsciiTablePage() {
  const [selected, setSelected] = useState<AsciiEntry | null>(null);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);

  const matchedDecs = useMemo(() => {
    if (!search.trim()) return new Set<number>();
    const q = search.toLowerCase();
    const set = new Set<number>();
    for (const e of DATA) {
      if (
        e.char.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.dec.toString().includes(q) ||
        e.hex.toLowerCase().includes(q)
      ) {
        set.add(e.dec);
      }
    }
    return set;
  }, [search]);

  const rowGroups = useMemo(() => {
    const groups: AsciiEntry[][] = [];
    for (let row = 0; row < 8; row++) {
      groups.push(DATA.slice(row * COLS, (row + 1) * COLS));
    }
    return groups;
  }, []);

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
              Interactive character reference with descriptions
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
              placeholder="Search by character, description, hex, decimal..."
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#171717]" />
              <span className="text-neutral-600 uppercase tracking-wider">Control</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0f0f0f]" />
              <span className="text-green-400 uppercase tracking-wider">Digits</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0f0f0f]" />
              <span className="text-[#8A2BE2] uppercase tracking-wider">Uppercase</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0f0f0f]" />
              <span className="text-sky-400 uppercase tracking-wider">Lowercase</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0f0f0f]" />
              <span className="text-neutral-400 uppercase tracking-wider">Symbols</span>
            </span>
          </div>

          {hovered !== null && (
            <div className="mb-3 px-3 py-2 rounded-md bg-[#171717] border border-[#262626] text-xs text-neutral-400 font-mono min-h-[1.5rem]">
              <span className="text-neutral-200">{DATA[hovered].code || "Hover a cell"}</span>
              {DATA[hovered].description && (
                <span className="text-neutral-500"> — {DATA[hovered].description}</span>
              )}
              <span className="text-neutral-600 ml-2">[{DATA[hovered].dec}, 0x{DATA[hovered].hex}]</span>
            </div>
          )}

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="pb-2 pr-2 w-20 text-[10px] font-mono text-neutral-700 font-normal text-right">
                    Dec
                  </th>
                  {COL_LABELS.map((h) => (
                    <th key={h} className="pb-2 px-0.5 text-center text-[10px] font-mono text-neutral-700 font-normal">
                      <span className="text-neutral-500">0x</span>{h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowGroups.map((entries) => {
                  const rowStart = entries[0].dec;

                  return (
                    <tr key={rowStart}>
                      <td className="pr-2 py-0.5 text-right">
                        <div className="text-[10px] font-mono text-neutral-700">
                          {rowStart}
                        </div>
                      </td>
                      {entries.map((entry) => {
                        const isSelected = selected?.dec === entry.dec;
                        const isMatched = matchedDecs.has(entry.dec);
                        const isSpace = entry.dec === 32;
                        const displayChar = isSpace ? "·" : (entry.category === "control" ? entry.code : entry.char);

                        return (
                          <td key={entry.dec} className="p-0">
                            <button
                              onClick={() => setSelected(isSelected ? null : entry)}
                              onMouseEnter={() => setHovered(entry.dec)}
                              onMouseLeave={() => setHovered((prev) => prev === entry.dec ? null : prev)}
                              className={`w-full aspect-square flex flex-col items-center justify-center rounded cursor-pointer transition-all duration-150 border border-transparent hover:border-[#3a3a3a] ${
                                cellBg(entry.category, isSelected, isMatched)
                              }`}
                              title={entry.description || entry.code}
                            >
                              <span className={`text-sm font-mono leading-tight ${
                                entry.category === "control" ? "text-[9px]" : ""
                              }`}>
                                {isSpace ? (
                                  <span className="inline-block px-1 text-[10px] border border-dashed border-neutral-700 rounded text-neutral-500">sp</span>
                                ) : (
                                  displayChar
                                )}
                              </span>
                              <span className="text-[9px] leading-none opacity-60 mt-0.5">
                                {entry.dec}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#171717] border border-[#262626] text-2xl font-mono text-[#ededed]">
                  {selected.category === "control" ? selected.code : selected.char}
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#ededed]">
                    {selected.code || selected.char}
                    {selected.description && (
                      <span className="font-normal text-neutral-500 ml-1">— {selected.description}</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    U+{selected.hex.padStart(4, "0")}
                  </div>
                </div>
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
              {selected.entity && <DetailCard label="HTML Entity" value={selected.entity} />}
              {selected.category === "control" && (
                <DetailCard label="Escape" value={`\\x${selected.hex}`} />
              )}
              <DetailCard label="Unicode" value={`U+${selected.hex.padStart(4, "0")}`} />
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About ASCII Table</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              ASCII (American Standard Code for Information Interchange)
              maps 128 characters to numbers 0–127. Hover over any cell to see
              its description and decimal/hex code; click for full details with
              copy buttons.
            </p>
            <p>
              <strong>0–31 &amp; 127</strong> — Control characters for terminals
              and protocols (NUL, TAB, CR/LF, ESC, DEL...).{" "}
              <strong>48–57</strong> — Digits 0–9.{" "}
              <strong>65–90</strong> — Uppercase A–Z.{" "}
              <strong>97–122</strong> — Lowercase a–z. The rest are punctuation
              and symbols.
            </p>
            <p>
              Each cell shows the character and its decimal value. The table
              follows the classic 8×16 layout arranged by the hex digit of the
              code: rows <code className="text-xs text-neutral-500">0x0_</code>{" "}
              through <code className="text-xs text-neutral-500">0x7_</code>,
              columns <code className="text-xs text-neutral-500">0</code> through{" "}
              <code className="text-xs text-neutral-500">F</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, spaced = false }: { label: string; value: string; spaced?: boolean }) {
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
      <code className={`block text-sm font-mono text-[#ededed] break-all ${spaced ? "tracking-[0.15em]" : ""}`}>
        {value}
      </code>
    </div>
  );
}
