"use client";

import { useState, useMemo } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { parseColor, relativeLuminance, contrastRatio, type ContrastResult } from "@/lib/color";
import ColorPicker from "@/components/ColorPicker";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField } from "@/components/Field";
import { Badge } from "@/components/ValueRow";

function StatusBadge({ pass }: { pass: boolean }) {
  return (
    <Badge tone={pass ? "success" : "error"}>
      {pass ? "✓ Pass" : "✗ Fail"}
    </Badge>
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
    <ToolPage>
      <ToolHeader
        icon={CheckCircleIcon}
        title="Contrast Checker"
        description="Check WCAG 2.0 contrast ratios between two colors"
      />

      <CardStack>
        <Card label="Colors">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="contrast-fg">Foreground</FieldLabel>
              <div className="flex items-center gap-3">
                <ColorPicker
                  color={fgPicker}
                  onChange={(hex) => { setFgPicker(hex); setFgInput(hex); }}
                />
                <TextField
                  id="contrast-fg"
                  type="text"
                  value={fgInput}
                  onChange={(e) => {
                    setFgInput(e.target.value);
                    const p = parseColor(e.target.value);
                    if (p) setFgPicker(p.hex);
                  }}
                  placeholder="#FFFFFF"
                  invalid={!!fgInput && !fg}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="contrast-bg">Background</FieldLabel>
              <div className="flex items-center gap-3">
                <ColorPicker
                  color={bgPicker}
                  onChange={(hex) => { setBgPicker(hex); setBgInput(hex); }}
                />
                <TextField
                  id="contrast-bg"
                  type="text"
                  value={bgInput}
                  onChange={(e) => {
                    setBgInput(e.target.value);
                    const p = parseColor(e.target.value);
                    if (p) setBgPicker(p.hex);
                  }}
                  placeholder="#8A2BE2"
                  invalid={!!bgInput && !bg}
                />
              </div>
            </div>
          </div>
        </Card>

        {fg && bg && (
          <Card label="Preview">
            <div
              className="flex w-full flex-col items-center justify-center gap-3 rounded-control px-6 py-10"
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
                <FieldLabel>Results</FieldLabel>

                <div className="flex flex-col gap-4 rounded-control bg-field p-4 sm:flex-row sm:items-center">
                  <div className="text-center sm:px-2">
                    <span className="font-mono text-3xl font-bold text-accent">{result.ratio.toFixed(1)}</span>
                    <span className="mt-1 block text-xs text-fg-secondary">:1 ratio</span>
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <ResultCell label="AA Normal" pass={result.aaNormal} />
                    <ResultCell label="AA Large" pass={result.aaLarge} />
                    <ResultCell label="AAA Normal" pass={result.aaaNormal} />
                    <ResultCell label="AAA Large" pass={result.aaaLarge} />
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        <AboutCard title="About WCAG Contrast">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}

function ResultCell({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex min-h-control items-center justify-between gap-2 rounded-control bg-surface-elevated py-1 pr-2 pl-3.5">
      <span className="text-[13px] font-medium text-fg-secondary">{label}</span>
      <StatusBadge pass={pass} />
    </div>
  );
}
