"use client";

import { useState, useMemo, useCallback } from "react";
import {
  GradientIcon,
} from "@phosphor-icons/react/dist/ssr";
import { parseColor, generatePalette, rgbToHex, hslToRgb, type Harmony } from "@/lib/color";
import ColorPicker from "@/components/ColorPicker";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import CopyButton from "@/components/CopyButton";

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
    <div className="flex flex-col overflow-hidden rounded-tile bg-surface-elevated">
      <div className="h-20 w-full" style={{ backgroundColor: bg }} />
      <div className="flex flex-col gap-0.5 px-3.5 pt-3 pb-1.5">
        <span className="text-xs font-medium text-fg-secondary">{label}</span>
        <code className="block font-mono text-sm text-fg">{hex}</code>
        <code className="block font-mono text-xs text-fg-secondary">
          hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
        </code>
        <CopyButton variant="inline" copied={copied} onClick={handleCopy} label="Copy HEX" copiedLabel="Copied" />
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
    <ToolPage>
      <ToolHeader
        icon={GradientIcon}
        title="Palette Generator"
        description="Generate color harmonies from a base color"
      />

      <CardStack>
        <Card label="Base color">
          <div className="flex items-center gap-3">
            <ColorPicker
              color={pickerColor}
              onChange={(hex) => { setPickerColor(hex); setInput(hex); }}
            />
            <TextField
              type="text"
              aria-label="Base color"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (parseColor(e.target.value)) setPickerColor(parseColor(e.target.value)!.hex.toLowerCase());
              }}
              placeholder="#8A2BE2, rgb(138, 43, 226)"
              invalid={!!input && !color}
            />
          </div>
        </Card>

        <Card label="Harmony">
          <SegmentedControl
            ariaLabel="Harmony"
            value={harmony}
            onChange={setHarmony}
            options={harmonies}
          />
        </Card>

        {palette && (
          <Card label="Palette">
            <div className={`grid gap-3 ${palette.length <= 3 ? "grid-cols-2 sm:grid-cols-3" : palette.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-5"}`}>
              {palette.map((c, i) => (
                <ColorSwatch key={i} hsl={c} label={i === 0 ? "Base" : `Color ${i + 1}`} />
              ))}
            </div>
          </Card>
        )}

        <AboutCard title="About Palette Generator">
          <p>
            <strong>Complementary</strong> — opposite on the color wheel
            (180° apart). <strong>Analogous</strong> — adjacent colors
            (±30°). <strong>Triadic</strong> — three evenly spaced colors
            (120°). <strong>Tetradic</strong> — four colors in a square
            (90°). <strong>Monochromatic</strong> — variations in saturation
            and lightness.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
