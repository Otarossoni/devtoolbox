"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DropHalfIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { parseColor } from "@/lib/color";
import ColorPicker from "@/components/ColorPicker";

function Row({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <span className="text-xs text-neutral-500 min-w-16">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-sm font-mono text-[#ededed] text-right">{value}</code>
        <button
          onClick={handleCopy}
          className={`shrink-0 p-1 rounded transition-colors duration-200 cursor-pointer ${copied ? "text-green-400" : "text-neutral-600 hover:text-[#8A2BE2]"}`}
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function ColorConverterPage() {
  const [input, setInput] = useState("#8A2BE2");
  const [pickerColor, setPickerColor] = useState("#8A2BE2");

  const color = useMemo(() => parseColor(input), [input]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <DropHalfIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Color Converter</h1>
            <p className="text-sm text-neutral-500">
              Convert between HEX, RGB, HSL, and CSS color formats
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
          </div>

          <div className="flex gap-3 items-center">
            <ColorPicker
              color={pickerColor}
              onChange={(hex) => { setPickerColor(hex); setInput(hex); }}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (parseColor(e.target.value)) setPickerColor(parseColor(e.target.value)!.hex.toLowerCase());
              }}
              placeholder="#8A2BE2, rgb(138, 43, 226), hsl(271, 76%, 53%)"
              className={`flex-1 px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                input && !color ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
              }`}
            />
          </div>

          <p className="text-xs text-neutral-600 mt-2">
            Try: <code className="text-neutral-500">#8A2BE2</code>{" "}
            <code className="text-neutral-500">rgb(138, 43, 226)</code>{" "}
            <code className="text-neutral-500">hsl(271, 76%, 53%)</code>{" "}
            <code className="text-neutral-500">tomato</code>
          </p>
        </div>

        {color && (
          <>
            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Preview</span>
              </div>

              <div
                className="w-full h-24 rounded-lg border border-[#262626]"
                style={{ backgroundColor: color.hex }}
              />
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Values</span>
              </div>

              <div className="space-y-2">
                <Row label="HEX" value={color.hex} />
                <Row label="RGB" value={color.rgb} />
                {color.rgba && <Row label="RGBA" value={color.rgba} />}
                <Row label="HSL" value={color.hsl} />
              </div>
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Raw</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Red</span>
                  <code className="text-lg font-mono text-[#ededed]">{color.r}</code>
                </div>
                <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Green</span>
                  <code className="text-lg font-mono text-[#ededed]">{color.g}</code>
                </div>
                <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Blue</span>
                  <code className="text-lg font-mono text-[#ededed]">{color.b}</code>
                </div>
                <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Hue</span>
                  <code className="text-lg font-mono text-[#ededed]">{color.h}°</code>
                </div>
                <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Sat</span>
                  <code className="text-lg font-mono text-[#ededed]">{color.s}%</code>
                </div>
                <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Light</span>
                  <code className="text-lg font-mono text-[#ededed]">{color.l}%</code>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Color Converter</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Convert colors between HEX, RGB, HSL, and CSS named colors.
              Use the color picker or type any format directly — all values
              update live.
            </p>
            <p>
              Supports <strong>HEX</strong> (#8A2BE2, #8B2),{" "}
              <strong>RGB/RGBA</strong> (rgb(138, 43, 226)),{" "}
              <strong>HSL/HSLA</strong> (hsl(271, 76%, 53%)), and most common{" "}
              CSS named colors (tomato, gold, indigo).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
