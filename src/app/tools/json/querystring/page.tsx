"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { jsonToQueryString, queryStringToJSON } from "@/lib/json";

type ConvMode = "json2qs" | "qs2json";

export default function JSONQueryStringPage() {
  const [mode, setMode] = useState<ConvMode>("json2qs");
  const [jsonInput, setJsonInput] = useState("");
  const [qsInput, setQsInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentInput = mode === "json2qs" ? jsonInput : qsInput;

  const result = useMemo((): { output: string; error: string } => {
    if (!currentInput.trim()) return { output: "", error: "" };
    const r = mode === "json2qs"
      ? jsonToQueryString(currentInput)
      : queryStringToJSON(currentInput);
    return { output: r.result, error: r.error || "" };
  }, [currentInput, mode]);

  const handleCopy = useCallback(async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.output]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ArrowsLeftRightIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">JSON ↔ Query String</h1>
            <p className="text-sm text-neutral-500">
              Convert between JSON objects and URL query strings
            </p>
          </div>
        </div>

        <div className="animate-5 flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setMode("json2qs")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "json2qs"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            JSON → QS
          </button>
          <button
            onClick={() => setMode("qs2json")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "qs2json"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            QS → JSON
          </button>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
          </div>

          <textarea
            value={currentInput}
            onChange={(e) =>
              mode === "json2qs"
                ? setJsonInput(e.target.value)
                : setQsInput(e.target.value)
            }
            placeholder={
              mode === "json2qs"
                ? 'Paste a JSON object...\ne.g. {"name":"Alice","age":30}'
                : "Paste a URL or query string...\ne.g. name=Alice&age=30 or ?name=Alice&age=30"
            }
            rows={8}
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

        {result.output && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Output</span>
            </div>

            <textarea
              value={result.output}
              readOnly
              rows={8}
              className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none resize-none"
            />

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

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About JSON ↔ Query String</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              <strong>JSON → QS</strong> — converts a flat or nested JSON
              object into a URL-encoded query string. Arrays use{" "}
              <code className="text-xs text-neutral-500">key[]</code> notation,
              nested objects use <code className="text-xs text-neutral-500">key[sub]</code>.
            </p>
            <p>
              <strong>QS → JSON</strong> — parses a query string back into a
              JSON object. Paste a full URL (with{" "}
              <code className="text-xs text-neutral-500">?</code>) or just the
              query string portion. Supports nested keys and array notation.
            </p>
            <p>
              Powered by the browser&rsquo;s native URLSearchParams API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
