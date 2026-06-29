"use client";

import { useState, useMemo, useCallback } from "react";
import { BracketsAngleIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";

type EncMode = "encode" | "decode";

function encodeEntities(text: string, encodeNonAscii: boolean): string {
  let result = text.replace(/&/g, "&amp;");
  result = result.replace(/</g, "&lt;");
  result = result.replace(/>/g, "&gt;");
  result = result.replace(/"/g, "&quot;");
  result = result.replace(/'/g, "&#39;");

  if (encodeNonAscii) {
    result = result.replace(/[^\x00-\x7F]/g, (ch) => {
      return `&#x${ch.codePointAt(0)?.toString(16).toUpperCase()};`;
    });
  }

  return result;
}

function decodeEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export default function HtmlEntitiesPage() {
  const [mode, setMode] = useState<EncMode>("encode");
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [copied, setCopied] = useState(false);

  const input = mode === "encode" ? encodeInput : decodeInput;

  const output = useMemo(() => {
    if (!(mode === "encode" ? encodeInput : decodeInput).trim()) return "";
    try {
      return mode === "encode"
        ? encodeEntities(encodeInput, encodeNonAscii)
        : decodeEntities(decodeInput);
    } catch {
      return "";
    }
  }, [mode, encodeInput, decodeInput, encodeNonAscii]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <BracketsAngleIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">HTML Entities</h1>
            <p className="text-sm text-neutral-500">
              Encode and decode HTML entities
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
            {mode === "encode" && (
              <button
                onClick={() => setEncodeNonAscii(!encodeNonAscii)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono transition-all duration-200 cursor-pointer border ${
                  encodeNonAscii
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {encodeNonAscii ? "Emoji → hex" : "Emoji as-is"}
              </button>
            )}
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              if (mode === "encode") setEncodeInput(e.target.value);
              else setDecodeInput(e.target.value);
            }}
            placeholder={
              mode === "encode"
                ? "Type HTML to encode...\ne.g. <div>Hello & welcome</div>"
                : "Paste HTML entities to decode...\ne.g. &lt;div&gt;Hello &amp; welcome&lt;/div&gt;"
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
          <h2 className="text-sm font-semibold mb-3">About HTML Entities</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              HTML entities allow you to safely represent reserved characters
              in HTML. For example, <code className="text-xs text-neutral-500">&lt;</code>{" "}
              is represented as <code className="text-xs text-neutral-500">&amp;lt;</code>{" "}
              to avoid being interpreted as a tag opener.
            </p>
            <p>
              <strong>Encode</strong> replaces <code className="text-xs text-neutral-500">&amp;</code>{" "}
              (first), <code className="text-xs text-neutral-500">&lt;</code>,{" "}
              <code className="text-xs text-neutral-500">&gt;</code>,{" "}
              <code className="text-xs text-neutral-500">&quot;</code>, and{" "}
              <code className="text-xs text-neutral-500">&#39;</code>. Toggle
              &ldquo;Emoji → hex&rdquo; to also convert non-ASCII characters
              like 😀 into <code className="text-xs text-neutral-500">&amp;#x1F600;</code>.
            </p>
            <p>
              <strong>Decode</strong> uses the browser&rsquo;s native HTML
              parser to safely decode all named and numeric entities back to
              their original characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
