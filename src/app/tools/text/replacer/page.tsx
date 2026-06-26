"use client";

import { useState, useCallback } from "react";
import {
  RepeatIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";

export default function TextReplacerPage() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [flags, setFlags] = useState({ g: true, i: false });
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const flagsStr = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("");

  const handleReplaceAll = useCallback(() => {
    if (!find) return;
    setError("");

    if (useRegex) {
      try {
        const regex = new RegExp(find, flagsStr + "g");
        const matches = text.match(regex);
        setCount(matches ? matches.length : 0);
        setOutput(text.replace(regex, replace));
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    } else {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = text.match(new RegExp(escaped, "g"));
      setCount(matches ? matches.length : 0);
      setOutput(text.split(find).join(replace));
    }
  }, [text, find, replace, useRegex, flagsStr]);

  const handleReplaceFirst = useCallback(() => {
    if (!find) return;
    setError("");

    if (useRegex) {
      try {
        const regex = new RegExp(find, flagsStr);
        const match = regex.exec(text);
        if (!match) {
          setCount(0);
          setOutput(text);
          return;
        }
        setCount(1);
        setOutput(
          text.slice(0, match.index) + replace + text.slice(match.index + match[0].length),
        );
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    } else {
      const idx = text.indexOf(find);
      if (idx === -1) {
        setCount(0);
        setOutput(text);
        return;
      }
      setCount(1);
      setOutput(
        text.slice(0, idx) + replace + text.slice(idx + find.length),
      );
    }
  }, [text, find, replace, useRegex, flagsStr]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    setOutput("");
    setCount(0);
    setError("");
  }, []);

  const handleFindChange = useCallback((value: string) => {
    setFind(value);
    setOutput("");
    setCount(0);
    setError("");
  }, []);

  const handleReplaceChange = useCallback((value: string) => {
    setReplace(value);
    setOutput("");
    setCount(0);
  }, []);

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
            <RepeatIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Text Replacer</h1>
            <p className="text-sm text-neutral-500">
              Find and replace text with plain or regex search
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Text
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type or paste text here..."
            rows={10}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Search & Replace
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                Find
              </label>
              <input
                value={find}
                onChange={(e) => handleFindChange(e.target.value)}
                placeholder="Text or pattern..."
                className={`w-full px-3 py-2 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
                  error
                    ? "border-red-500/50"
                    : "border-[#262626] focus:border-[#8A2BE2]"
                }`}
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                Replace with
              </label>
              <input
                value={replace}
                onChange={(e) => handleReplaceChange(e.target.value)}
                placeholder="Replacement..."
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-3 font-mono">{error}</p>
          )}

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${
                useRegex
                  ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                  : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
              }`}
            >
              .* regex
            </button>

            {useRegex && (
              <div className="flex gap-1">
                {["g", "i"].map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      setFlags((prev) => ({
                        ...prev,
                        [f]: !prev[f as keyof typeof flags],
                      }))
                    }
                    className={`w-7 h-7 rounded-md text-xs font-mono font-medium transition-all duration-200 cursor-pointer border ${
                      flags[f as keyof typeof flags]
                        ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                        : "bg-[#171717] text-neutral-500 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReplaceFirst}
              disabled={!find}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              Replace First
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={!find}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              Replace All
            </button>
          </div>
        </div>

        {output && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Result
              </span>
              <span className="text-xs text-neutral-600">
                {count} replacement{count !== 1 ? "s" : ""}
              </span>
            </div>

            <textarea
              value={output}
              readOnly
              rows={10}
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
          <h2 className="text-sm font-semibold mb-3">About Text Replacer</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Find and replace text using plain string matching or regular
              expressions with live result and replacement count.
            </p>
            <p>
              <strong>Replace First</strong> — replaces only the first
              occurrence. <strong>Replace All</strong> — replaces every match.
            </p>
            <p>
              Enable <strong>regex</strong> to use regular expression patterns.
              The <strong>g</strong> flag applies globally (always on for
              Replace All), and <strong>i</strong> makes matching
              case-insensitive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
