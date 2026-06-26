"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
  FileIcon,
} from "@phosphor-icons/react/dist/ssr";

type Mode = "encode" | "decode";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function base64ToBlobUrl(base64: string, mime: string): string {
  const dataUrl = base64.startsWith("data:")
    ? base64
    : `data:${mime};base64,${base64}`;
  const base64Data = dataUrl.split(",")[1] || "";
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

function extractMime(base64: string): string {
  const match = base64.trim().match(/^data:([^;]+)/);
  return match ? match[1] : "application/octet-stream";
}

export default function Base64FilePage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [base64, setBase64] = useState("");
  const [fileSrc, setFileSrc] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [decodedMime, setDecodedMime] = useState("");
  const [decodedSize, setDecodedSize] = useState(0);
  const [decodedReady, setDecodedReady] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = "";
    }
  }, []);

  // ---- Encode ----

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setError(false);
    revokeBlob();

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBase64(dataUrl);
      const url = base64ToBlobUrl(dataUrl, file.type);
      blobUrlRef.current = url;
      setFileSrc(url);
    };
    reader.readAsDataURL(file);
  }, [revokeBlob]);

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
      if (file) processFile(file);
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

  // ---- Decode ----

  const handleDecodeInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setBase64(value);
      revokeBlob();

      const trimmed = value.trim();
      if (!trimmed) {
        setFileSrc("");
        setDecodedReady(false);
        setError(false);
        return;
      }

      try {
        const mime = extractMime(trimmed);
        const url = base64ToBlobUrl(trimmed, mime);
        blobUrlRef.current = url;
        setFileSrc(url);
        setDecodedMime(mime);

        const base64Part = trimmed.split(",")[1] || trimmed;
        setDecodedSize(Math.round((base64Part.length * 3) / 4));
        setDecodedReady(true);
        setError(false);
      } catch {
        setFileSrc("");
        setDecodedReady(false);
        setError(true);
      }
    },
    [revokeBlob],
  );

  // ---- Common ----

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setBase64("");
    setFileSrc("");
    setFileName("");
    setFileSize(0);
    setDecodedMime("");
    setDecodedSize(0);
    setDecodedReady(false);
    setError(false);
    setCopied(false);
    revokeBlob();
  }, [revokeBlob]);

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
    if (!fileSrc) return;
    const a = document.createElement("a");
    a.href = fileSrc;
    a.download = fileName || "file";
    a.click();
  }, [fileSrc, fileName]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <FileIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Base64 File</h1>
            <p className="text-sm text-neutral-500">
              Encode any file to Base64 and decode it back
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
                {fileName && (
                  <span className="text-xs text-neutral-600">
                    {formatSize(fileSize)}
                  </span>
                )}
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
                    <FileIcon className="h-8 w-8 text-[#8A2BE2]" />
                    <span className="text-sm text-[#ededed] font-mono">
                      {fileName}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatSize(fileSize)} · Click or drop to change
                    </span>
                  </>
                ) : (
                  <>
                    <FileIcon className="h-8 w-8 text-neutral-600" />
                    <span className="text-sm text-neutral-500">
                      Drop any file here or click to browse
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
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
                placeholder="Paste a Base64 string..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </>
          )}

          {error && (
            <div className="flex items-center justify-center mt-4 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
              <span className="text-sm text-red-400">
                Invalid Base64 string
              </span>
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

              <div className="flex items-center justify-end mt-4 gap-2">
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

          {mode === "decode" && decodedReady && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Decoded file
                </span>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#171717] border border-[#262626]">
                <FileIcon className="h-6 w-6 text-[#8A2BE2] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#ededed] font-mono block truncate">
                    {decodedMime}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ~{formatSize(decodedSize)} decoded
                  </span>
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
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Base64 File</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Encode any file type to a Base64 string or decode a Base64
              string back to its original file. No file size limits — but
              very large files may be slow to encode.
            </p>
            <p>
              Encoding: drop or select any file to get its{" "}
              <code className="text-xs text-neutral-500">data:...;base64,...</code>{" "}
              string. Decoding: paste a Base64 string to download the
              reconstructed file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
