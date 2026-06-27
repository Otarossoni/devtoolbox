"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  EyedropperIcon,
  CopyIcon,
  CheckIcon,
  ImageIcon,
} from "@phosphor-icons/react/dist/ssr";
import { rgbToHex, rgbToHsl } from "@/lib/color";

export default function PixelExtractorPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [color, setColor] = useState<{ r: number; g: number; b: number; a: number; x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [showZoom, setShowZoom] = useState(false);

  const ZOOM_SIZE = 100;
  const ZOOM_SCALE = 5;
  const ZOOM_R = ZOOM_SIZE / ZOOM_SCALE / 2;

  useEffect(() => {
    if (!showZoom || !mousePos || !canvasRef.current || !zoomCanvasRef.current) return;
    const src = canvasRef.current;
    const srcCtx = src.getContext("2d");
    const zoomCanvas = zoomCanvasRef.current;
    const zoomCtx = zoomCanvas.getContext("2d");
    if (!srcCtx || !zoomCtx) return;

    const sx = Math.max(0, Math.floor(mousePos.x - ZOOM_R));
    const sy = Math.max(0, Math.floor(mousePos.y - ZOOM_R));
    const sw = ZOOM_R * 2;
    const sh = ZOOM_R * 2;
    const pixel = srcCtx.getImageData(Math.floor(mousePos.x), Math.floor(mousePos.y), 1, 1).data;

    zoomCanvas.width = ZOOM_SIZE;
    zoomCanvas.height = ZOOM_SIZE;
    zoomCtx.imageSmoothingEnabled = false;
    zoomCtx.drawImage(src, sx, sy, sw, sh, 0, 0, ZOOM_SIZE, ZOOM_SIZE);

    // Grid
    zoomCtx.strokeStyle = "rgba(255,255,255,0.1)";
    zoomCtx.lineWidth = 0.5;
    for (let i = 0; i < ZOOM_SCALE; i++) {
      zoomCtx.beginPath(); zoomCtx.moveTo(i * ZOOM_R * 2, 0); zoomCtx.lineTo(i * ZOOM_R * 2, ZOOM_SIZE); zoomCtx.stroke();
      zoomCtx.beginPath(); zoomCtx.moveTo(0, i * ZOOM_R * 2); zoomCtx.lineTo(ZOOM_SIZE, i * ZOOM_R * 2); zoomCtx.stroke();
    }

    // Crosshair border
    const cx = ZOOM_SIZE / 2, cy = ZOOM_SIZE / 2, hs = ZOOM_R;
    const inv = pixel[0] < 128 ? 255 : 0;
    zoomCtx.strokeStyle = `rgba(${inv},${inv},${inv},0.9)`;
    zoomCtx.lineWidth = 2;
    zoomCtx.strokeRect(cx - hs, cy - hs, hs * 2, hs * 2);

    // Crosshair
    zoomCtx.strokeStyle = `rgba(${inv},${inv},${inv},0.5)`;
    zoomCtx.lineWidth = 1;
    zoomCtx.beginPath(); zoomCtx.moveTo(cx, 0); zoomCtx.lineTo(cx, ZOOM_SIZE); zoomCtx.stroke();
    zoomCtx.beginPath(); zoomCtx.moveTo(0, cy); zoomCtx.lineTo(ZOOM_SIZE, cy); zoomCtx.stroke();
  }, [mousePos, showZoom, ZOOM_R]);

  const handleMouseEnter = useCallback(() => setShowZoom(true), []);
  const handleMouseLeave = useCallback(() => { setShowZoom(false); setMousePos(null); setZoomPos(null); }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setMousePos({ x: Math.floor(e.clientX - rect.left), y: Math.floor(e.clientY - rect.top) });
      setZoomPos({ x: e.clientX + 24, y: e.clientY + 24 });
    },
    [],
  );

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      setImgW(img.naturalWidth);
      setImgH(img.naturalHeight);

      const containerWidth = containerRef.current?.clientWidth || 768;
      const s = Math.min(1, (containerWidth - 32) / img.naturalWidth);
      setScale(s);
      canvas.width = img.naturalWidth * s;
      canvas.height = img.naturalHeight * s;
      canvas.style.width = canvas.width + "px";
      canvas.style.height = canvas.height + "px";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = URL.createObjectURL(image);
  }, [image]);

  const processFile = useCallback((file: File) => {
    setImage(file);
    setColor(null);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith("image/")) processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) processFile(file);
    },
    [processFile],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      const pixel = ctx.getImageData(x, y, 1, 1).data;

      setColor({
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        a: pixel[3] / 255,
        x: Math.round(x / scale),
        y: Math.round(y / scale),
      });
    },
    [scale],
  );

  const hex = color ? rgbToHex(color.r, color.g, color.b) : "";
  const hsl = color ? rgbToHsl(color.r, color.g, color.b) : null;
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "";
  const rgbStr = color ? `rgb(${color.r}, ${color.g}, ${color.b})` : "";
  const rgbaStr = color && color.a < 1 ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` : "";

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <EyedropperIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Pixel Color Extractor</h1>
            <p className="text-sm text-neutral-500">
              Click on any pixel to extract its color
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Upload</span>
          </div>

          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors duration-200 cursor-pointer min-h-[120px] ${
                isDragging
                  ? "border-[#8A2BE2] bg-[#8A2BE2]/5"
                  : "border-[#262626] hover:border-[#3a3a3a]"
              }`}
            >
              <ImageIcon className="h-8 w-8 text-neutral-600" />
              <span className="text-sm text-neutral-500">Drop an image or click to browse</span>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <span className="text-sm text-[#ededed] font-mono">{image.name}</span>
              <span className="text-xs text-neutral-500 ml-3">
                {imgW}×{imgH} · Click to change
              </span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {image && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Click to pick a color</span>
            </div>

            <div ref={containerRef} className="rounded-lg bg-black border border-[#262626] flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                className="cursor-crosshair block"
              />
              {showZoom && zoomPos && (
                <canvas
                  ref={zoomCanvasRef}
                  className="fixed rounded-lg border-2 border-[#8A2BE2] pointer-events-none shadow-lg"
                  style={{
                    left: zoomPos.x,
                    top: zoomPos.y,
                    zIndex: 9999,
                  }}
                />
              )}
            </div>
          </div>
        )}

        {color && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Extracted color</span>
              <span className="text-xs text-neutral-600">
                ({color.x}, {color.y})
              </span>
            </div>

            <div className="flex gap-4 items-start flex-col sm:flex-row">
              <div
                className="w-24 h-24 rounded-lg border border-[#262626] shrink-0"
                style={{ backgroundColor: hex }}
              />
              <div className="flex-1 w-full space-y-2">
                <CopyRow label="HEX" value={hex} />
                <CopyRow label="RGB" value={rgbStr} />
                {rgbaStr && <CopyRow label="RGBA" value={rgbaStr} />}
                <CopyRow label="HSL" value={hslStr} />
              </div>
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Pixel Extractor</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Upload any image and click on a pixel to extract its exact color.
              The color is returned in HEX, RGB, and HSL formats with individual
              copy buttons. Coordinates show the original image pixel position.
            </p>
            <p>
              Works with PNG, JPEG, WebP, and other common image formats.
              All processing happens locally via the Canvas API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <span className="text-xs text-neutral-500">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-sm font-mono text-[#ededed]">{value}</code>
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
