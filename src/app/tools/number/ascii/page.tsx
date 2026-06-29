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
  category: "control" | "digit" | "upper" | "lower" | "symbol";
}

const CONTROL_DESCRIPTIONS: Record<number, string> = {
  0: "Null character", 1: "Start of Heading", 2: "Start of Text", 3: "End of Text",
  4: "End of Transmission", 5: "Enquiry", 6: "Acknowledge", 7: "Bell / Alert",
  8: "Backspace", 9: "Horizontal Tab", 10: "Line Feed / Newline", 11: "Vertical Tab",
  12: "Form Feed", 13: "Carriage Return", 14: "Shift Out", 15: "Shift In",
  16: "Data Link Escape", 17: "Device Control 1 (XON)", 18: "Device Control 2", 19: "Device Control 3 (XOFF)",
  20: "Device Control 4", 21: "Negative Acknowledge", 22: "Synchronous Idle",
  23: "End of Transmission Block", 24: "Cancel", 25: "End of Medium",
  26: "Substitute", 27: "Escape", 28: "File Separator", 29: "Group Separator",
  30: "Record Separator", 31: "Unit Separator",
};

const SYMBOL_NAMES: Record<number, string> = {
  32: "Space",
  33: "Exclamation mark", 34: "Double quotes (or speech marks)", 35: "Number sign", 36: "Dollar sign",
  37: "Percent sign", 38: "Ampersand", 39: "Single quote", 40: "Open parenthesis",
  41: "Close parenthesis", 42: "Asterisk", 43: "Plus sign", 44: "Comma",
  45: "Hyphen-minus", 46: "Period / Full stop", 47: "Slash / Divide",
  58: "Colon", 59: "Semicolon", 60: "Less than (or open angled bracket)",
  61: "Equals sign", 62: "Greater than (or close angled bracket)", 63: "Question mark",
  64: "At sign",
  91: "Opening bracket", 92: "Backslash", 93: "Closing bracket",
  94: "Caret / Circumflex", 95: "Underscore", 96: "Grave accent",
  123: "Opening curly brace", 124: "Vertical bar / Pipe", 125: "Closing curly brace",
  126: "Tilde",
};

const NAMES: Record<number, string> = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "HT", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN",
  23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS",
  30: "RS", 31: "US", 127: "DEL",
};

const CHAR_NAMES: Record<number, string> = {
  48: "Zero", 49: "One", 50: "Two", 51: "Three", 52: "Four",
  53: "Five", 54: "Six", 55: "Seven", 56: "Eight", 57: "Nine",
  65: "Uppercase A", 66: "Uppercase B", 67: "Uppercase C", 68: "Uppercase D",
  69: "Uppercase E", 70: "Uppercase F", 71: "Uppercase G", 72: "Uppercase H",
  73: "Uppercase I", 74: "Uppercase J", 75: "Uppercase K", 76: "Uppercase L",
  77: "Uppercase M", 78: "Uppercase N", 79: "Uppercase O", 80: "Uppercase P",
  81: "Uppercase Q", 82: "Uppercase R", 83: "Uppercase S", 84: "Uppercase T",
  85: "Uppercase U", 86: "Uppercase V", 87: "Uppercase W", 88: "Uppercase X",
  89: "Uppercase Y", 90: "Uppercase Z",
  97: "Lowercase a", 98: "Lowercase b", 99: "Lowercase c", 100: "Lowercase d",
  101: "Lowercase e", 102: "Lowercase f", 103: "Lowercase g", 104: "Lowercase h",
  105: "Lowercase i", 106: "Lowercase j", 107: "Lowercase k", 108: "Lowercase l",
  109: "Lowercase m", 110: "Lowercase n", 111: "Lowercase o", 112: "Lowercase p",
  113: "Lowercase q", 114: "Lowercase r", 115: "Lowercase s", 116: "Lowercase t",
  117: "Lowercase u", 118: "Lowercase v", 119: "Lowercase w", 120: "Lowercase x",
  121: "Lowercase y", 122: "Lowercase z",
};

function getDescription(dec: number): string {
  if (dec <= 31) return CONTROL_DESCRIPTIONS[dec] ?? "";
  if (dec === 127) return "Delete";
  return CHAR_NAMES[dec] ?? SYMBOL_NAMES[dec] ?? "";
}

function getCategory(dec: number): AsciiEntry["category"] {
  if (dec <= 31 || dec === 127) return "control";
  if (dec >= 48 && dec <= 57) return "digit";
  if (dec >= 65 && dec <= 90) return "upper";
  if (dec >= 97 && dec <= 122) return "lower";
  return "symbol";
}

function toBin(dec: number): string {
  return dec.toString(2).padStart(8, "0");
}

const DATA: AsciiEntry[] = Array.from({ length: 128 }, (_, dec) => ({
  dec,
  hex: dec.toString(16).toUpperCase().padStart(2, "0"),
  oct: dec.toString(8).padStart(3, "0"),
  bin: toBin(dec),
  char: String.fromCharCode(dec),
  code: NAMES[dec] ?? "",
  description: getDescription(dec),
  entity: `&#${dec};`,
  category: getCategory(dec),
}));

const CONTROLS = DATA.slice(0, 32);
const PRINTABLES = DATA.slice(32, 128);

function rowTextColor(cat: AsciiEntry["category"]): string {
  switch (cat) {
    case "control": return "text-neutral-600";
    case "digit": return "text-green-400";
    case "upper": return "text-[#8A2BE2]";
    case "lower": return "text-sky-400";
    default: return "text-neutral-300";
  }
}

function rowBg(selected: boolean): string {
  return selected ? "bg-[#8A2BE2]/10 border-[#8A2BE2]/30" : "border-transparent hover:bg-[#171717] hover:border-[#262626]";
}

export default function AsciiTablePage() {
  const [selected, setSelected] = useState<AsciiEntry | null>(null);
  const [search, setSearch] = useState("");

  const filter = useCallback((list: AsciiEntry[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((e) =>
      e.description.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.char.includes(q) ||
      e.dec.toString().includes(q) ||
      e.hex.toLowerCase().includes(q) ||
      e.entity.includes(q)
    );
  }, [search]);

  const filteredControls = useMemo(() => filter(CONTROLS), [filter]);
  const filteredPrintables = useMemo(() => filter(PRINTABLES), [filter]);

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
              Complete ASCII reference with character codes and descriptions
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="relative mb-6">
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

          <SectionTable
            title="Control characters"
            subtitle="0–31"
            entries={filteredControls}
            selected={selected}
            onSelect={setSelected}
          />

          {filteredControls.length > 0 && filteredPrintables.length > 0 && (
            <div className="border-t border-[#262626] my-6" />
          )}

          <SectionTable
            title="Printable characters"
            subtitle="32–127"
            entries={filteredPrintables}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {selected && (
          <DetailPanel entry={selected} onClose={() => setSelected(null)} />
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About ASCII Table</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              ASCII (American Standard Code for Information Interchange)
              defines 128 characters numbered 0 through 127. Each row in the
              table above shows every representation of a character: decimal,
              octal, hexadecimal, 8-bit binary, the rendered symbol (or control
              code abbreviation), HTML numeric entity, and a human-readable
              description.
            </p>
            <p>
              <strong>0–31 &amp; 127</strong> — Control characters for
              terminals, printers, and communication protocols.{" "}
              <strong>32–126</strong> — Printable characters: space,
              punctuation, digits, uppercase and lowercase letters.
            </p>
            <p>
              Click any row to expand a detail panel with copyable values
              including Unicode code point and escape sequence. Use the
              search bar to filter the table by any field.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTable({
  title,
  subtitle,
  entries,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  entries: AsciiEntry[];
  selected: AsciiEntry | null;
  onSelect: (e: AsciiEntry | null) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] text-neutral-600 font-mono">{subtitle}</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        {/* Desktop table */}
        <table className="hidden sm:table w-full border-collapse">
          <thead>
            <tr className="border-b border-[#262626]">
              <Th>Dec</Th>
              <Th>Oct</Th>
              <Th>Hex</Th>
              <Th>Bin</Th>
              <Th>Char</Th>
              <Th>HTML</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const isSel = selected?.dec === e.dec;
              const isControl = e.category === "control";
              return (
                <tr
                  key={e.dec}
                  onClick={() => onSelect(isSel ? null : e)}
                  className={`border-b border-[#262626]/50 cursor-pointer transition-colors duration-150 ${rowBg(isSel)}`}
                >
                  <Td mono highlight>{e.dec}</Td>
                  <Td mono dim>{e.oct}</Td>
                  <Td mono dim>0x{e.hex}</Td>
                  <Td mono dim extraSmall>{e.bin}</Td>
                  <Td mono color={rowTextColor(e.category)}>
                    {isControl ? e.code : e.char}
                  </Td>
                  <Td mono dim extraSmall>{e.entity}</Td>
                  <Td dim label>{e.description}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile table */}
        <table className="sm:hidden w-full border-collapse">
          <thead>
            <tr className="border-b border-[#262626]">
              <Th>Dec</Th>
              <Th>Hex</Th>
              <Th>Char</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const isSel = selected?.dec === e.dec;
              const isControl = e.category === "control";
              return (
                <tr
                  key={e.dec}
                  onClick={() => onSelect(isSel ? null : e)}
                  className={`border-b border-[#262626]/50 cursor-pointer transition-colors duration-150 ${rowBg(isSel)}`}
                >
                  <Td mono highlight>{e.dec}</Td>
                  <Td mono dim>0x{e.hex}</Td>
                  <Td mono color={rowTextColor(e.category)}>
                    {isControl ? e.code : e.char}
                  </Td>
                  <Td dim label small>{e.description}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-2 py-2 text-left text-[10px] text-neutral-600 uppercase tracking-wider font-medium">
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  dim,
  highlight,
  color,
  label,
  extraSmall,
  small,
}: {
  children: React.ReactNode;
  mono?: boolean;
  dim?: boolean;
  highlight?: boolean;
  color?: string;
  label?: boolean;
  extraSmall?: boolean;
  small?: boolean;
}) {
  return (
    <td
      className={`px-2 py-1.5 whitespace-nowrap ${
        mono ? "font-mono" : ""
      } ${
        extraSmall ? "text-[10px]" : small ? "text-[11px]" : "text-xs"
      } ${
        dim ? "text-neutral-500" : highlight ? "text-neutral-200" : label ? "text-neutral-400" : color ?? "text-neutral-400"
      }`}
    >
      {children}
    </td>
  );
}

function DetailPanel({ entry, onClose }: { entry: AsciiEntry; onClose: () => void }) {
  const isControl = entry.category === "control";

  return (
    <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#171717] border border-[#262626] text-2xl font-mono ${rowTextColor(entry.category)}`}>
            {isControl ? entry.code : entry.char}
          </span>
          <div>
            <div className="text-sm font-semibold text-[#ededed]">
              {isControl ? entry.code : entry.char}
              <span className="font-normal text-neutral-500 ml-2">— {entry.description}</span>
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">
              U+{entry.hex.padStart(4, "0")} · {entry.category === "control" ? "Control character" : entry.category === "digit" ? "Digit" : entry.category === "upper" ? "Uppercase letter" : entry.category === "lower" ? "Lowercase letter" : "Symbol"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Cell label="Decimal" value={entry.dec.toString()} />
        <Cell label="Octal" value={`0o${entry.oct}`} />
        <Cell label="Hexadecimal" value={`0x${entry.hex}`} />
        <Cell label="Binary" value={entry.bin} spaced />
        <Cell label="HTML Entity" value={entry.entity} />
        <Cell label="Unicode" value={`U+${entry.hex.padStart(4, "0")}`} />
        {isControl && <Cell label="Escape" value={`\\x${entry.hex}`} />}
        <Cell label="Description" value={entry.description} />
      </div>
    </div>
  );
}

function Cell({ label, value, spaced = false }: { label: string; value: string; spaced?: boolean }) {
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
