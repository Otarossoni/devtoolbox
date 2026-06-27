"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { parseColor, rgbToHex, hslToRgb } from "@/lib/color";

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
}

const GRID_W = 232;
const GRID_H = 160;

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [h, setH] = useState(271);
  const [s, setS] = useState(76);
  const [l, setL] = useState(53);
  const [hexInput, setHexInput] = useState(color);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const parsed = parseColor(color);
    if (parsed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setH(parsed.h);
      setS(parsed.s);
      setL(parsed.l);
      setHexInput(parsed.hex);
    }
  }, [color]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const emit = useCallback(
    (h2: number, s2: number, l2: number) => {
      setH(h2);
      setS(s2);
      setL(l2);
      const rgb = hslToRgb(h2, s2, l2);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(GRID_W, GRID_H);
    for (let y = 0; y < GRID_H; y++) {
      const ly = 100 - (y / GRID_H) * 100;
      for (let x = 0; x < GRID_W; x++) {
        const sx = (x / GRID_W) * 100;
        const rgb = hslToRgb(h, sx, ly);
        const i = (y * GRID_W + x) * 4;
        imageData.data[i] = rgb.r;
        imageData.data[i + 1] = rgb.g;
        imageData.data[i + 2] = rgb.b;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // draw cursor
    const cx = (s / 100) * GRID_W;
    const cy = ((100 - l) / 100) * GRID_H;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = l > 50 ? "#000" : "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.strokeStyle = l > 50 ? "#fff" : "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [h, s, l]);

  useEffect(() => {
    if (open) drawGrid();
  }, [open, drawGrid]);

  const pickFromCanvas = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const x = Math.max(0, Math.min(GRID_W - 1, e.clientX - rect.left));
      const y = Math.max(0, Math.min(GRID_H - 1, e.clientY - rect.top));
      const sx = Math.round((x / GRID_W) * 100);
      const ly = Math.round((1 - y / GRID_H) * 100);
      emit(h, sx, ly);
    },
    [h, emit],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      pickFromCanvas(e);
    },
    [pickFromCanvas],
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging.current) pickFromCanvas(e);
    },
    [pickFromCanvas],
  );

  const syncFromHex = useCallback(() => {
    const parsed = parseColor(hexInput);
    if (parsed) {
      emit(parsed.h, parsed.s, parsed.l);
    }
  }, [hexInput, emit]);

  const previewColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => {
          const rect = triggerRef.current?.getBoundingClientRect();
          if (rect) setPanelPos({ top: rect.bottom + 8, left: rect.left });
          setOpen(!open);
        }}
        className="w-10 h-10 rounded-lg border border-[#262626] cursor-pointer shrink-0 hover:border-[#3a3a3a] transition-colors duration-200"
        style={{ background: previewColor }}
        aria-label="Open color picker"
      />

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[200] w-[264px] p-4 rounded-xl border border-[#262626] bg-[#0a0a0a] shadow-2xl space-y-3"
            style={{ top: panelPos.top, left: panelPos.left }}
          >
          <canvas
            ref={canvasRef}
            width={GRID_W}
            height={GRID_H}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="w-full h-auto rounded-lg border border-[#262626] cursor-crosshair"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Hue</span>
              <span className="text-[10px] font-mono text-neutral-600">{h}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={h}
              onChange={(e) => emit(parseInt(e.target.value), s, l)}
              className="w-full h-2.5 rounded-full appearance-none cursor-pointer border border-[#262626]"
              style={{
                background: `linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)`,
              }}
            />
          </div>

          <div className="flex gap-3 items-end">
            <div
              className="w-10 h-10 rounded-lg border border-[#262626] shrink-0"
              style={{ background: previewColor }}
            />
            <div className="flex-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={syncFromHex}
                onKeyDown={(e) => { if (e.key === "Enter") syncFromHex(); }}
                className="w-full px-3 py-1.5 rounded-md bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
