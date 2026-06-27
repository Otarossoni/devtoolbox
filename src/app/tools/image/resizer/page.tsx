"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ResizeIcon,
  DownloadSimpleIcon,
  ImageIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
} from "@phosphor-icons/react/dist/ssr";

type Format = "png" | "jpeg" | "webp";

const FORMATS: { value: Format; label: string; mime: string }[] = [
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { value: "webp", label: "WebP", mime: "image/webp" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageResizerPage() {
  const [image, setImage] = useState<File | null>(null);
  const [originalW, setOriginalW] = useState(0);
  const [originalH, setOriginalH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<Format>("jpeg");
  const [previewSrc, setPreviewSrc] = useState("");
  const [resizedSize, setResizedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const resize = useCallback(
    (w: number, h: number, file: File) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const mime = FORMATS.find((f) => f.value === format)!.mime;
        canvas.toBlob((blob) => {
          if (!blob) return;
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setPreviewSrc(url);
          setResizedSize(blob.size);
        }, mime);
      };
      img.src = URL.createObjectURL(file);
    },
    [format],
  );

  const processFile = useCallback((file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOriginalW(img.naturalWidth);
        setOriginalH(img.naturalHeight);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        resize(img.naturalWidth, img.naturalHeight, file);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, [resize]);

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

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const w = parseInt(e.target.value) || 0;
      setWidth(w);
      if (lockAspect && originalW > 0) {
        const h = Math.round((w / originalW) * originalH);
        setHeight(h);
        if (w > 0 && h > 0) resize(w, h, image!);
      } else if (w > 0 && height > 0) {
        resize(w, height, image!);
      }
    },
    [lockAspect, originalW, originalH, height, resize, image],
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = parseInt(e.target.value) || 0;
      setHeight(h);
      if (lockAspect && originalH > 0) {
        const w = Math.round((h / originalH) * originalW);
        setWidth(w);
        if (w > 0 && h > 0) resize(w, h, image!);
      } else if (width > 0 && h > 0) {
        resize(width, h, image!);
      }
    },
    [lockAspect, originalW, originalH, width, resize, image],
  );

  const handleResize = useCallback(() => {
    if (width > 0 && height > 0) resize(width, height, image!);
  }, [width, height, resize, image]);

  const handleDownload = useCallback(() => {
    if (!previewSrc) return;
    const a = document.createElement("a");
    a.href = previewSrc;
    const ext = format === "jpeg" ? "jpg" : format;
    a.download = `resized.${ext}`;
    a.click();
  }, [previewSrc, format]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ResizeIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Image Resizer</h1>
            <p className="text-sm text-neutral-500">
              Resize images with aspect ratio lock
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Upload</span>
          </div>

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
            {image ? (
              <>
                <ImageIcon className="h-8 w-8 text-[#8A2BE2]" />
                <span className="text-sm text-[#ededed] font-mono">{image.name}</span>
                <span className="text-xs text-neutral-500">
                  {originalW}×{originalH} · {formatSize(image.size)} · Click or drop to change
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-neutral-600" />
                <span className="text-sm text-neutral-500">Drop an image or click to browse</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {image && (
          <>
            <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Dimensions</span>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs transition-all duration-200 cursor-pointer border ${
                    lockAspect
                      ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                      : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                  }`}
                >
                  {lockAspect ? (
                    <LockKeyIcon className="h-3 w-3" />
                  ) : (
                    <LockKeyOpenIcon className="h-3 w-3" />
                  )}
                  {lockAspect ? "Locked" : "Unlocked"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Width</label>
                  <input
                    type="number"
                    value={width || ""}
                    onChange={handleWidthChange}
                    placeholder="Width"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">Height</label>
                  <input
                    type="number"
                    value={height || ""}
                    onChange={handleHeightChange}
                    placeholder="Height"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer border ${
                        format === f.value
                          ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                          : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleResize}
                  className="px-4 py-2 rounded-md text-xs font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer shrink-0"
                >
                  Resize
                </button>
              </div>

              <p className="text-xs text-neutral-600 mt-3">
                Original: {originalW}×{originalH} · {formatSize(image.size)}
                {width > 0 && height > 0 && (width !== originalW || height !== originalH) && (
                  <span> → {width}×{height}</span>
                )}
              </p>
            </div>

            {previewSrc && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Preview · {formatSize(resizedSize)}
                  </span>
                </div>

                <div className="rounded-lg bg-black border border-[#262626] p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-w-full max-h-80 rounded object-contain"
                  />
                </div>

                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
                  >
                    <DownloadSimpleIcon className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Image Resizer</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Resize any image by setting exact width and height. Toggle the
              aspect ratio lock to maintain proportions or set dimensions
              independently. All processing happens locally via the Canvas API.
            </p>
            <p>
              <strong>Locked</strong> — changing one dimension updates the
              other to preserve the original aspect ratio.{" "}
              <strong>Unlocked</strong> — set both dimensions freely. Output
              format can be PNG, JPEG, or WebP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
