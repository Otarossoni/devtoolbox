"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ImageSquareIcon,
  DownloadSimpleIcon,
  ImageIcon,
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

export default function ImageConverterPage() {
  const [image, setImage] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState("");
  const [format, setFormat] = useState<Format>("jpeg");
  const [quality, setQuality] = useState(0.85);
  const [convertedSrc, setConvertedSrc] = useState("");
  const [convertedSize, setConvertedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const convert = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setOriginalSrc(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const mime = FORMATS.find((f) => f.value === format)!.mime;
        const q = format === "png" ? undefined : quality;
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setConvertedSrc(url);
            setConvertedSize(blob.size);
          },
          mime,
          q,
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [format, quality]);

  const processFile = useCallback((file: File) => {
    setImage(file);
    convert(file);
  }, [convert]);

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

  const handleReconvert = useCallback(() => {
    if (image) convert(image);
  }, [image, convert]);

  const handleDownload = useCallback(() => {
    if (!convertedSrc) return;
    const a = document.createElement("a");
    a.href = convertedSrc;
    const ext = format === "jpeg" ? "jpg" : format;
    a.download = `image.${ext}`;
    a.click();
  }, [convertedSrc, format]);

  const hasQuality = format !== "png";

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ImageSquareIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Image Converter</h1>
            <p className="text-sm text-neutral-500">
              Convert images between PNG, JPEG, and WebP
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
                  {formatSize(image.size)} · Click or drop to change
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
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Options</span>
                <button
                  onClick={handleReconvert}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
                >
                  Convert
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
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

              {hasQuality && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Quality</span>
                    <span className="text-xs font-mono text-[#ededed]">{quality.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer border border-[#262626] bg-[#171717] accent-[#8A2BE2]"
                  />
                </div>
              )}
            </div>

            {convertedSrc && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-2">
                      Original · {formatSize(image.size)}
                    </span>
                    <div className="rounded-lg bg-black border border-[#262626] p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={originalSrc}
                        alt="Original"
                        className="max-w-full max-h-60 rounded object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-2">
                      {FORMATS.find((f) => f.value === format)!.label} · {formatSize(convertedSize)}
                    </span>
                    <div className="rounded-lg bg-black border border-[#262626] p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={convertedSrc}
                        alt="Converted"
                        className="max-w-full max-h-60 rounded object-contain"
                      />
                    </div>
                  </div>
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
          <h2 className="text-sm font-semibold mb-3">About Image Converter</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Convert images between PNG, JPEG, and WebP formats entirely in
              your browser. Nothing is uploaded — all processing happens
              locally via the Canvas API.
            </p>
            <p>
              <strong>PNG</strong> — lossless, supports transparency.{" "}
              <strong>JPEG</strong> — lossy, smaller files, no transparency.{" "}
              <strong>WebP</strong> — modern format, smaller than both with
              quality comparable to JPEG.
            </p>
            <p>
              Adjust quality (0.1–1.0) for JPEG and WebP. PNG ignores quality
              since it&rsquo;s always lossless. Click <strong>Convert</strong>{" "}
              to re-process after changing options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
