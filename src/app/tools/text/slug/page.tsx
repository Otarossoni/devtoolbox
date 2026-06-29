"use client";

import { useState, useMemo } from "react";
import { TextAaIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";

function slugify(text: string, sep: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`${escapeRegExp(sep)}+`, "g"), sep)
    .replace(new RegExp(`^${escapeRegExp(sep)}|${escapeRegExp(sep)}$`, "g"), "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SEPARATORS = [
  { value: "-", label: "Hyphen (-)" },
  { value: "_", label: "Underscore (_)" },
  { value: "~", label: "Tilde (~)" },
];

export default function TextToSlugPage() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [customSep, setCustomSep] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [copied, setCopied] = useState(false);

  const sep = useCustom && customSep ? customSep : separator;

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return slugify(input.trim(), sep);
  }, [input, sep]);

  const handleCopy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <TextAaIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Text to Slug</h1>
            <p className="text-sm text-neutral-500">
              Convert text to URL-friendly slugs
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Input</span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to slugify..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none mb-4"
          />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Separator</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SEPARATORS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setSeparator(s.value); setUseCustom(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${
                  !useCustom && separator === s.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${
                useCustom
                  ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                  : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
              }`}
            >
              Custom
            </button>
            {useCustom && (
              <input
                type="text"
                value={customSep}
                onChange={(e) => setCustomSep(e.target.value.slice(0, 3))}
                placeholder="e.g. -"
                className="w-16 px-2 py-1.5 rounded-md bg-black border border-[#8A2BE2] text-xs font-mono text-[#ededed] placeholder:text-neutral-600 outline-none"
                autoFocus
              />
            )}
          </div>
        </div>

        {output && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Output</span>
            </div>

            <textarea
              value={output}
              readOnly
              rows={4}
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
          <h2 className="text-sm font-semibold mb-3">About Text to Slug</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              A slug is a URL-friendly version of a string — typically used
              for blog post URLs, CMS entries, and file names. Characters are
              lowercased, accents are removed, and everything except letters
              and digits is replaced by the chosen separator.
            </p>
            <p>
              Choose from <strong>hyphen (-)</strong>,{" "}
              <strong>underscore (_)</strong>, <strong>tilde (~)</strong>, or
              type a custom separator (up to 3 characters). Consecutive
              separators are collapsed into one, and leading/trailing
              separators are trimmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
