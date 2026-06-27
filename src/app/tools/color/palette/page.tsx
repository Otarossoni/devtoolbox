"use client";

import { useState, useMemo, useCallback } from "react";
import {
  GradientIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { parseColor, generatePalette, rgbToHex, hslToRgb, type Harmony } from "@/lib/color";
import ColorPicker from "@/components/ColorPicker";

const harmonies: { value: Harmony; label: string }[] = [
  { value: "complementary", label: "Complementary" },
  { value: "analogous", label: "Analogous" },
  { value: "triadic", label: "Triadic" },
  { value: "tetradic", label: "Tetradic" },
  { value: "monochromatic", label: "Monochromatic" },
];

function ColorSwatch({ hsl, label }: { hsl: { h: number; s: number; l: number }; label: string }) {
  const [copied, setCopied] = useState(false);
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const bg = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(hex); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [hex]);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[#262626]">
      <div className="h-20 w-full" style={{ backgroundColor: bg }} />
      <div className="p-3 bg-[#171717] space-y-1">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</span>
        <code className="block text-sm font-mono text-[#ededed]">{hex}</code>
        <code className="block text-xs font-mono text-neutral-500">
          hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
        </code>
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1 text-[10px] transition-colors duration-200 cursor-pointer ${copied ? "text-green-400" : "text-neutral-600 hover:text-[#8A2BE2]"}`}
        >
          {copied ? <><CheckIcon className="h-3 w-3" /> Copied</> : <><CopyIcon className="h-3 w-3" /> Copy HEX</>}
        </button>
      </div>
    </div>
  );
}

export default function PaletteGeneratorPage() {
  const [input, setInput] = useState("#8A2BE2");
  const [pickerColor, setPickerColor] = useState("#8A2BE2");
  const [harmony, setHarmony] = useState<Harmony>("complementary");

  const color = useMemo(() => parseColor(input), [input]);

  const palette = useMemo(() => {
    if (!color) return null;
    const base = { h: color.h, s: color.s, l: color.l };
    return generatePalette(base, harmony);
  }, [color, harmony]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <GradientIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Palette Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate color harmonies from a base color
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Base color</span>
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
              placeholder="#8A2BE2, rgb(138, 43, 226)"
              className={`flex-1 px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                input && !color ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
              }`}
            />
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Harmony</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {harmonies.map((h) => (
              <button
                key={h.value}
                onClick={() => setHarmony(h.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  harmony === h.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {palette && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Palette</span>
            </div>

            <div className={`grid gap-3 ${palette.length <= 3 ? "grid-cols-2 sm:grid-cols-3" : palette.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-5"}`}>
              {palette.map((c, i) => (
                <ColorSwatch key={i} hsl={c} label={i === 0 ? "Base" : `Color ${i + 1}`} />
              ))}
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Palette Generator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              <strong>Complementary</strong> — opposite on the color wheel
              (180° apart). <strong>Analogous</strong> — adjacent colors
              (±30°). <strong>Triadic</strong> — three evenly spaced colors
              (120°). <strong>Tetradic</strong> — four colors in a square
              (90°). <strong>Monochromatic</strong> — variations in saturation
              and lightness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
