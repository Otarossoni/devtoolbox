"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowsLeftRightIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";

type EncMode = "encode" | "decode";

export default function URLEncoderPage() {
  const [mode, setMode] = useState<EncMode>("encode");
  const [input, setInput] = useState("");
  const [encodeAll, setEncodeAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return mode === "encode"
        ? encodeAll
          ? encodeURIComponent(input)
          : encodeURI(input)
        : encodeAll
          ? decodeURIComponent(input)
          : decodeURI(input);
    } catch {
      return mode === "encode" ? "" : "Invalid encoded string";
    }
  }, [input, mode, encodeAll]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ArrowsLeftRightIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">URL Encoder / Decoder</h1>
            <p className="text-sm text-neutral-500">
              Encode and decode URL components
            </p>
          </div>
        </div>

        <div className="animate-5 flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setMode("encode")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "encode"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
              mode === "decode"
                ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
            }`}
          >
            Decode
          </button>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
            <button
              onClick={() => setEncodeAll(!encodeAll)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${
                encodeAll
                  ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                  : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
              }`}
            >
              {encodeAll ? "Full" : "URL-safe"}
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Type text to encode...\ne.g. hello world & more"
                : "Paste encoded string to decode...\ne.g. hello%20world%20%26%20more"
            }
            rows={6}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />
        </div>

        {output && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Output</span>
            </div>

            <textarea
              value={output}
              readOnly
              rows={6}
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
          <h2 className="text-sm font-semibold mb-3">About URL Encoding</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              <strong>Full</strong> — uses <code className="text-xs text-neutral-500">encodeURIComponent</code>, encodes all special
              characters including slashes and ampersands. Ideal for query
              string values and form data.
            </p>
            <p>
              <strong>URL-safe</strong> — uses <code className="text-xs text-neutral-500">encodeURI</code>, preserves URL structure
              characters like <code className="text-xs text-neutral-500">/ ? & #</code>. Useful when you want
              a readable URL with special characters only in the query values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
