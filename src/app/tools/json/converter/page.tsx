"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { jsonToCSV, csvToJSON } from "@/lib/json";

type ConvMode = "json2csv" | "csv2json";

export default function JSONConverterPage() {
  const [mode, setMode] = useState<ConvMode>("json2csv");
  const [jsonInput, setJsonInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentInput = mode === "json2csv" ? jsonInput : csvInput;

  const result = useMemo(() => {
    if (!currentInput.trim()) return { result: "", error: "" };
    return mode === "json2csv" ? jsonToCSV(currentInput) : csvToJSON(currentInput);
  }, [currentInput, mode]);

  const handleCopy = useCallback(async () => {
    if (!result.result) return;
    try {
      await navigator.clipboard.writeText(result.result);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.result]);

  const handleDownload = useCallback(() => {
    if (!result.result) return;
    const ext = mode === "json2csv" ? "csv" : "json";
    const type = mode === "json2csv" ? "text/csv" : "application/json";
    const blob = new Blob([result.result], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result.result, mode]);

  const hasOutput = !!result.result;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ArrowsLeftRightIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">JSON ↔ CSV</h1>
            <p className="text-sm text-neutral-500">
              Convert between JSON arrays and CSV format
            </p>
          </div>
        </div>

        <div className="animate-5 flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setMode("json2csv")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "json2csv"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            JSON → CSV
          </button>
          <button
            onClick={() => setMode("csv2json")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "csv2json"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            CSV → JSON
          </button>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Input
            </span>
          </div>

          <textarea
            value={currentInput}
            onChange={(e) =>
              mode === "json2csv"
                ? setJsonInput(e.target.value)
                : setCsvInput(e.target.value)
            }
            placeholder={
              mode === "json2csv"
                ? 'Paste a JSON array of objects...\ne.g. [{"name":"Alice","age":30}]'
                : "Paste CSV data...\ne.g.\nname,age\nAlice,30\nBob,25"
            }
            rows={10}
            className={`w-full px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 resize-none ${
              result.error
                ? "border-red-500/50"
                : "border-[#262626] focus:border-[#8A2BE2]"
            }`}
          />
        </div>

        {result.error && (
          <div className="animate-9 rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-red-400 uppercase tracking-wider">Error</span>
            </div>
            <span className="text-sm text-red-400 font-mono">{result.error}</span>
          </div>
        )}

        {hasOutput && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Output
              </span>
            </div>

            <textarea
              value={result.result}
              readOnly
              rows={12}
              className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
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
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30 transition-all duration-200 cursor-pointer"
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About JSON ↔ CSV</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              <strong>JSON → CSV</strong> — converts an array of objects into
              comma-separated values. The first object determines the column
              headers. Nested objects and arrays are stringified.
            </p>
            <p>
              <strong>CSV → JSON</strong> — converts CSV data back into a JSON
              array of objects. The first row is treated as headers. All
              values are parsed as strings.
            </p>
            <p>
              CSV export handles commas, quotes, and newlines in cell values
              with proper escaping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
