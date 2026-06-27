"use client";

import { useState, useMemo } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { parseColor, relativeLuminance, contrastRatio, type ContrastResult } from "@/lib/color";
import ColorPicker from "@/components/ColorPicker";

function StatusBadge({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
        pass
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      {pass ? "✓ Pass" : "✗ Fail"}
    </span>
  );
}

export default function ContrastCheckerPage() {
  const [fgInput, setFgInput] = useState("#FFFFFF");
  const [fgPicker, setFgPicker] = useState("#FFFFFF");
  const [bgInput, setBgInput] = useState("#8A2BE2");
  const [bgPicker, setBgPicker] = useState("#8A2BE2");

  const fg = useMemo(() => parseColor(fgInput), [fgInput]);
  const bg = useMemo(() => parseColor(bgInput), [bgInput]);

  const result = useMemo((): ContrastResult | null => {
    if (!fg || !bg) return null;
    const l1 = relativeLuminance(fg.r, fg.g, fg.b);
    const l2 = relativeLuminance(bg.r, bg.g, bg.b);
    const ratio = contrastRatio(l1, l2);
    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [fg, bg]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <CheckCircleIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Contrast Checker</h1>
            <p className="text-sm text-neutral-500">
              Check WCAG 2.0 contrast ratios between two colors
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Colors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                Foreground
              </label>
              <div className="flex gap-3 items-center">
                <ColorPicker
                  color={fgPicker}
                  onChange={(hex) => { setFgPicker(hex); setFgInput(hex); }}
                />
                <input
                  type="text"
                  value={fgInput}
                  onChange={(e) => {
                    setFgInput(e.target.value);
                    const p = parseColor(e.target.value);
                    if (p) setFgPicker(p.hex);
                  }}
                  placeholder="#FFFFFF"
                  className={`flex-1 px-3 py-2 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                    fgInput && !fg ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                Background
              </label>
              <div className="flex gap-3 items-center">
                <ColorPicker
                  color={bgPicker}
                  onChange={(hex) => { setBgPicker(hex); setBgInput(hex); }}
                />
                <input
                  type="text"
                  value={bgInput}
                  onChange={(e) => {
                    setBgInput(e.target.value);
                    const p = parseColor(e.target.value);
                    if (p) setBgPicker(p.hex);
                  }}
                  placeholder="#8A2BE2"
                  className={`flex-1 px-3 py-2 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                    bgInput && !bg ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {fg && bg && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Preview</span>
            </div>

            <div
              className="w-full rounded-lg border border-[#262626] px-6 py-10 flex flex-col items-center justify-center gap-3"
              style={{ backgroundColor: bg.hex }}
            >
              <p className="text-2xl font-bold" style={{ color: fg.hex }}>
                The five boxing wizards jump quickly
              </p>
              <p className="text-sm" style={{ color: fg.hex }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789 · !@#$%^&*()
              </p>
            </div>

            {result && (
              <>
                <div className="flex items-center justify-between mt-4 mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Results</span>
                </div>

                <div className="flex items-center gap-4 mb-4 p-4 rounded-lg bg-black border border-[#262626]">
                  <div className="text-center">
                    <span className="text-3xl font-mono font-bold text-[#8A2BE2]">{result.ratio.toFixed(1)}</span>
                    <span className="block text-[10px] text-neutral-500 mt-1">:1 ratio</span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#171717] border border-[#262626]">
                      <span className="text-[11px] text-neutral-400">AA Normal</span>
                      <StatusBadge pass={result.aaNormal} />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#171717] border border-[#262626]">
                      <span className="text-[11px] text-neutral-400">AA Large</span>
                      <StatusBadge pass={result.aaLarge} />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#171717] border border-[#262626]">
                      <span className="text-[11px] text-neutral-400">AAA Normal</span>
                      <StatusBadge pass={result.aaaNormal} />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#171717] border border-[#262626]">
                      <span className="text-[11px] text-neutral-400">AAA Large</span>
                      <StatusBadge pass={result.aaaLarge} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About WCAG Contrast</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              <strong>AA Normal</strong> — 4.5:1 minimum for regular text (below 18pt bold or 24pt regular).{" "}
              <strong>AA Large</strong> — 3:1 for large text (18pt+ bold or 24pt+).{" "}
              <strong>AAA Normal</strong> — 7:1 enhanced for regular text.{" "}
              <strong>AAA Large</strong> — 4.5:1 enhanced for large text.
            </p>
            <p>
              Contrast ratio is calculated using the WCAG 2.0 relative luminance formula.
              Values range from 1:1 (identical colors) to 21:1 (black on white).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
