"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DropHalfIcon,
} from "@phosphor-icons/react/dist/ssr";
import { parseColor } from "@/lib/color";
import ColorPicker from "@/components/ColorPicker";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField } from "@/components/Field";
import CopyButton from "@/components/CopyButton";
import { ValueRow, ValueTile } from "@/components/ValueRow";

function Row({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <ValueRow
      label={label}
      value={value}
      action={<CopyButton variant="icon" copied={copied} onClick={handleCopy} label={`Copy ${label}`} copiedLabel="Copied!" />}
    />
  );
}

export default function ColorConverterPage() {
  const [input, setInput] = useState("#8A2BE2");
  const [pickerColor, setPickerColor] = useState("#8A2BE2");

  const color = useMemo(() => parseColor(input), [input]);

  return (
    <ToolPage>
      <ToolHeader
        icon={DropHalfIcon}
        title="Color Converter"
        description="Convert between HEX, RGB, HSL, and CSS color formats"
      />

      <CardStack>
        <Card label="Input">
          <div className="flex items-center gap-3">
            <ColorPicker
              color={pickerColor}
              onChange={(hex) => { setPickerColor(hex); setInput(hex); }}
            />
            <TextField
              type="text"
              aria-label="Color"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (parseColor(e.target.value)) setPickerColor(parseColor(e.target.value)!.hex.toLowerCase());
              }}
              placeholder="#8A2BE2, rgb(138, 43, 226), hsl(271, 76%, 53%)"
              invalid={!!input && !color}
            />
          </div>
          <p className="text-xs text-fg-tertiary [&_code]:font-mono [&_code]:text-fg-secondary">
            Try: <code>#8A2BE2</code>{" "}
            <code>rgb(138, 43, 226)</code>{" "}
            <code>hsl(271, 76%, 53%)</code>{" "}
            <code>tomato</code>
          </p>
        </Card>

        {color && (
          <>
            <Card label="Preview">
              <div
                className="h-24 w-full rounded-control"
                style={{ backgroundColor: color.hex }}
              />
            </Card>

            <Card label="Values">
              <div className="space-y-2">
                <Row label="HEX" value={color.hex} />
                <Row label="RGB" value={color.rgb} />
                {color.rgba && <Row label="RGBA" value={color.rgba} />}
                <Row label="HSL" value={color.hsl} />
              </div>
            </Card>

            <Card label="Raw">
              <div className="grid grid-cols-3 gap-3">
                <ValueTile align="center" size="lg" label="Red" value={color.r} />
                <ValueTile align="center" size="lg" label="Green" value={color.g} />
                <ValueTile align="center" size="lg" label="Blue" value={color.b} />
                <ValueTile align="center" size="lg" label="Hue" value={`${color.h}°`} />
                <ValueTile align="center" size="lg" label="Sat" value={`${color.s}%`} />
                <ValueTile align="center" size="lg" label="Light" value={`${color.l}%`} />
              </div>
            </Card>
          </>
        )}

        <AboutCard title="About Color Converter">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
