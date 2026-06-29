"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { QrCodeIcon, DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import QRCode from "qrcode";

type ErrorLevel = "L" | "M" | "Q" | "H";

const EC_LEVELS: { value: ErrorLevel; label: string; desc: string }[] = [
  { value: "L", label: "L", desc: "~7% recovery" },
  { value: "M", label: "M", desc: "~15% recovery" },
  { value: "Q", label: "Q", desc: "~25% recovery" },
  { value: "H", label: "H", desc: "~30% recovery" },
];

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [ecLevel, setEcLevel] = useState<ErrorLevel>("M");
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(2);
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!text.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      QRCode.toDataURL(text.trim(), {
        errorCorrectionLevel: ecLevel,
        width: size,
        margin,
        color: {
          dark: `${dark}ff`,
          light: `${light}ff`,
        },
      })
        .then((url) => setDataUrl(url))
        .catch(() => setDataUrl(""));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, ecLevel, size, margin, dark, light]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }, [dataUrl]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 3000) {
      setText(value);
      if (!value.trim()) setDataUrl("");
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <QrCodeIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">QR Code Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate QR codes from any text or URL, live in your browser
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
            {text.length > 2500 && (
              <span className="text-[10px] text-amber-400 font-mono">
                {text.length} / 3000
              </span>
            )}
          </div>

          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text or URL to encode...&#10;e.g. https://example.com"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none mb-4"
          />

          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Error correction</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {EC_LEVELS.map((ec) => (
              <button
                key={ec.value}
                onClick={() => setEcLevel(ec.value)}
                className={`px-2 py-2 rounded-lg text-[10px] font-mono font-medium transition-all duration-200 cursor-pointer border ${
                  ecLevel === ec.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
                title={ec.desc}
              >
                {ec.label}
                <span className="block text-[9px] opacity-60">{ec.desc}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Size</span>
                <span className="text-[10px] font-mono text-neutral-400">{size}px</span>
              </div>
              <input
                type="range"
                min={128}
                max={1024}
                step={8}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#171717] border border-[#262626] accent-[#8A2BE2]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Margin</span>
                <span className="text-[10px] font-mono text-neutral-400">{margin}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#171717] border border-[#262626] accent-[#8A2BE2]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Dark</span>
              <input
                type="color"
                value={dark}
                onChange={(e) => setDark(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent p-0"
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Light</span>
              <input
                type="color"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-[#262626] bg-transparent p-0"
              />
            </label>
          </div>
        </div>

        {dataUrl && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Preview</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl bg-white p-4 inline-flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl}
                  alt="QR Code"
                  className="block"
                  style={{ width: size, height: size }}
                />
              </div>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                Download PNG
              </button>
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About QR Code Generator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Generate QR codes entirely in your browser — no data is sent
              anywhere. Enter any text or URL and get a live-updating QR code
              image.
            </p>
            <p>
              <strong>Error correction</strong> controls how much of the QR
              code can be damaged or obscured while still being readable:
              L (~7%), M (~15%), Q (~25%), H (~30%). Higher levels add more
              redundancy at the cost of larger QR codes.
            </p>
            <p>
              Adjust <strong>size</strong> (128–1024px), <strong>margin</strong>{" "}
              (quiet zone width), and <strong>colors</strong> for custom
              styling. Download as PNG with a single click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
