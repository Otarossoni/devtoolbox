"use client";

import { useState, useCallback, useMemo } from "react";
import { CopyIcon, CheckIcon, TextHIcon } from "@phosphor-icons/react/dist/ssr";
import { convertCase, type CaseStyle } from "@/lib/text";

const cases: { style: CaseStyle; label: string }[] = [
  { style: "lowercase", label: "lowercase" },
  { style: "uppercase", label: "UPPERCASE" },
  { style: "title", label: "Title Case" },
  { style: "camel", label: "camelCase" },
  { style: "pascal", label: "PascalCase" },
  { style: "snake", label: "snake_case" },
  { style: "kebab", label: "kebab-case" },
  { style: "constant", label: "CONSTANT_CASE" },
];

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<CaseStyle>("lowercase");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => convertCase(input, selected), [input, selected]);

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
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <TextHIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Case Converter</h1>
            <p className="text-sm text-neutral-500">
              Convert text between different letter cases
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Input
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text here..."
            rows={6}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {cases.map((c) => (
              <button
                key={c.style}
                onClick={() => setSelected(c.style)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${
                  selected === c.style
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Output
            </span>
            <span className="text-xs text-neutral-600">{output.length} chars</span>
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

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Case Conversion</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Convert text between common naming conventions used in programming.
              The converter detects word boundaries from spaces, hyphens, underscores,
              and camelCase transitions.
            </p>
            <p>
              <strong>lowercase</strong> — all letters lowercase.{" "}
              <strong>UPPERCASE</strong> — all letters uppercase.{" "}
              <strong>Title Case</strong> — first letter of each word capitalized.
            </p>
            <p>
              <strong>camelCase</strong> — first word lowercase, subsequent words
              capitalized. <strong>PascalCase</strong> — all words capitalized.{" "}
              <strong>snake_case</strong> — words joined by underscores.{" "}
              <strong>kebab-case</strong> — words joined by hyphens.{" "}
              <strong>CONSTANT_CASE</strong> — uppercase with underscores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
