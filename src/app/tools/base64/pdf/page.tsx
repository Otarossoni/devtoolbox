"use client";

import { useState, useCallback, useRef } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
  FilePdfIcon,
} from "@phosphor-icons/react/dist/ssr";

type Mode = "encode" | "decode";

export default function Base64PdfPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [base64, setBase64] = useState("");
  const [pdfSrc, setPdfSrc] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Encode: file upload ----

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setError(false);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBase64(dataUrl);
      setPdfSrc(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.type === "application/pdf" || file?.name.endsWith(".pdf")) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ---- Decode: base64 input ----

  const handleDecodeInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setBase64(value);

      const trimmed = value.trim();
      if (!trimmed) {
        setPdfSrc("");
        setError(false);
        return;
      }

      const src = trimmed.startsWith("data:application/pdf")
        ? trimmed
        : `data:application/pdf;base64,${trimmed}`;

      try {
        const base64Data = src.split(",")[1] || "";
        atob(base64Data);
        setPdfSrc(src);
        setError(false);
      } catch {
        setPdfSrc("");
        setError(true);
      }
    },
    [],
  );

  // ---- Common ----

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setBase64("");
    setPdfSrc("");
    setError(false);
    setCopied(false);
    setFileName("");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!base64) return;
    try {
      await navigator.clipboard.writeText(base64);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = base64;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [base64]);

  const handleDownload = useCallback(() => {
    if (!pdfSrc) return;
    const a = document.createElement("a");
    a.href = pdfSrc;
    a.download = fileName || "document.pdf";
    a.click();
  }, [pdfSrc, fileName]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <FilePdfIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Base64 PDF</h1>
            <p className="text-sm text-neutral-500">
              Encode PDF files to Base64 and decode them back
            </p>
          </div>
        </div>

        <div className="animate-5 flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => handleModeChange("encode")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "encode"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            <LockKeyIcon className="h-4 w-4" />
            Encode
          </button>
          <button
            onClick={() => handleModeChange("decode")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "decode"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            <LockKeyOpenIcon className="h-4 w-4" />
            Decode
          </button>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          {mode === "encode" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Upload
                </span>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors duration-200 cursor-pointer min-h-[120px] ${
                  isDragging
                    ? "border-[#8A2BE2] bg-[#8A2BE2]/5"
                    : "border-[#262626] hover:border-[#3a3a3a]"
                }`}
              >
                {fileName ? (
                  <>
                    <FilePdfIcon className="h-8 w-8 text-[#8A2BE2]" />
                    <span className="text-sm text-[#ededed] font-mono">
                      {fileName}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Click or drop to change
                    </span>
                  </>
                ) : (
                  <>
                    <FilePdfIcon className="h-8 w-8 text-neutral-600" />
                    <span className="text-sm text-neutral-500">
                      Drop a PDF here or click to browse
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Base64 Input
                </span>
              </div>

              <textarea
                value={base64}
                onChange={handleDecodeInput}
                placeholder="Paste a Base64 PDF string..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </>
          )}

          {(pdfSrc || error) && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Preview
                </span>
              </div>

              <div
                className={`flex items-center justify-center rounded-lg border min-h-[100px] p-2 ${
                  error
                    ? "border-red-500/30"
                    : "border-[#262626]"
                }`}
              >
                {error ? (
                  <span className="text-sm text-red-400">
                    {mode === "decode"
                      ? "Invalid Base64 PDF string"
                      : "Failed to process PDF"}
                  </span>
                ) : (
                  <embed
                    src={pdfSrc}
                    type="application/pdf"
                    className="w-full h-80 rounded"
                  />
                )}
              </div>
            </div>
          )}

          {mode === "encode" && base64 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Result
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-black border border-[#262626] min-h-14">
                <code className="text-xs font-mono text-[#ededed] break-all select-all line-clamp-3">
                  {base64.substring(0, 200)}
                  {base64.length > 200 && "..."}
                </code>
              </div>

              <div className="flex items-center justify-end mt-4">
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                    copied
                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                      : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {mode === "decode" && pdfSrc && (
            <div className="flex items-center justify-end mt-4">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          )}
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Base64 PDF</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Base64 encoding converts binary PDF data into a text string
              that can be embedded in HTML, JSON, or transmitted over
              text-based protocols.
            </p>
            <p>
              Encoding: upload a PDF to convert it into a{" "}
              <code className="text-xs text-neutral-500">data:application/pdf;base64,...</code>{" "}
              string ready to use.
            </p>
            <p>
              Decoding: paste a Base64 PDF string to preview and download
              the reconstructed file. Works with both raw Base64 and full
              data URI strings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
