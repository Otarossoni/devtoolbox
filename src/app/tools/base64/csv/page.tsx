"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
  FileCsvIcon,
} from "@phosphor-icons/react/dist/ssr";

type Mode = "encode" | "decode";

const MAX_PREVIEW_ROWS = 1000;

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

function base64ToText(base64: string): string {
  const trimmed = base64.trim();
  const base64Data = trimmed.includes(",") ? trimmed.split(",")[1] : trimmed;
  const binary = atob(base64Data);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        const row = rows[rows.length - 1] || [];
        row.push(current);
        if (rows.length === 0) rows.push(row);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        const row = rows[rows.length - 1] || [];
        row.push(current);
        if (rows.length === 0) rows.push(row);
        rows.push([]);
        current = "";
        if (ch === "\r") i++;
      } else if (ch !== "\r") {
        current += ch;
      }
    }
  }

  const lastRow = rows[rows.length - 1];
  if (lastRow) {
    lastRow.push(current);
  } else if (current) {
    rows.push([current]);
  }

  return rows.filter((r) => r.length > 0 && r.some((c) => c !== ""));
}

export default function Base64CsvPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [base64, setBase64] = useState("");
  const [csvSrc, setCsvSrc] = useState("");
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
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

  // ---- Encode: file upload ----

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setError(false);
    revokeBlob();

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBase64(dataUrl);
      const url = base64ToBlobUrl(dataUrl, "text/csv");
      blobUrlRef.current = url;
      setCsvSrc(url);

      const text = base64ToText(dataUrl);
      setCsvRows(parseCSV(text).slice(0, MAX_PREVIEW_ROWS));
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
      if (file?.name.endsWith(".csv") || file?.type === "text/csv") {
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
      revokeBlob();

      const trimmed = value.trim();
      if (!trimmed) {
        setCsvSrc("");
        setCsvRows([]);
        setError(false);
        return;
      }

      try {
        const url = base64ToBlobUrl(trimmed, "text/csv");
        blobUrlRef.current = url;
        setCsvSrc(url);

        const text = base64ToText(trimmed);
        setCsvRows(parseCSV(text).slice(0, MAX_PREVIEW_ROWS));
        setError(false);
      } catch {
        setCsvSrc("");
        setCsvRows([]);
        setError(true);
      }
    },
    [revokeBlob],
  );

  // ---- Common ----

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setBase64("");
    setCsvSrc("");
    setCsvRows([]);
    setError(false);
    setCopied(false);
    setFileName("");
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
    if (!csvSrc) return;
    const a = document.createElement("a");
    a.href = csvSrc;
    a.download = fileName || "document.csv";
    a.click();
  }, [csvSrc, fileName]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <FileCsvIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Base64 CSV</h1>
            <p className="text-sm text-neutral-500">
              Encode CSV files to Base64 and decode them back
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
                    <FileCsvIcon className="h-8 w-8 text-[#8A2BE2]" />
                    <span className="text-sm text-[#ededed] font-mono">
                      {fileName}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Click or drop to change
                    </span>
                  </>
                ) : (
                  <>
                    <FileCsvIcon className="h-8 w-8 text-neutral-600" />
                    <span className="text-sm text-neutral-500">
                      Drop a CSV here or click to browse
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
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
                placeholder="Paste a Base64 CSV string..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </>
          )}

          {(csvSrc || error) && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Preview
                </span>
              </div>

              <div
                className={`rounded-lg border min-h-[100px] overflow-hidden ${
                  error
                    ? "border-red-500/30"
                    : "border-[#262626]"
                }`}
              >
                {error ? (
                  <div className="flex items-center justify-center h-32">
                    <span className="text-sm text-red-400">
                      {mode === "decode"
                        ? "Invalid Base64 CSV string"
                        : "Failed to process CSV"}
                    </span>
                  </div>
                ) : csvRows.length > 0 ? (
                  <div className="overflow-auto max-h-80">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="bg-[#171717]">
                          {csvRows[0].map((cell, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left text-neutral-400 font-medium border-b border-[#262626] whitespace-nowrap"
                            >
                              {cell}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(1).map((row, ri) => (
                          <tr
                            key={ri}
                            className={
                              ri % 2 === 1 ? "bg-[#0a0a0a]" : "bg-black"
                            }
                          >
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="px-3 py-1.5 text-[#ededed] border-b border-[#262626]/50 whitespace-nowrap"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <span className="text-sm text-neutral-500">
                      Empty CSV file
                    </span>
                  </div>
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

          {mode === "decode" && csvSrc && (
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
          <h2 className="text-sm font-semibold mb-3">About Base64 CSV</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Base64 encoding converts CSV data into a text string that can
              be embedded in HTML, JSON, or transmitted over text-based
              protocols.
            </p>
            <p>
              Encoding: upload a CSV to convert it into a{" "}
              <code className="text-xs text-neutral-500">data:text/csv;base64,...</code>{" "}
              string ready to use.
            </p>
            <p>
              Decoding: paste a Base64 CSV string to preview the data as a
              table and download the reconstructed file. Works with both raw
              Base64 and full data URI strings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
