"use client";

import { useState, useCallback } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { encodeBase64, decodeBase64, isValidBase64 } from "@/lib/base64";

type Mode = "encode" | "decode";

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);

      if (!value.trim()) {
        setOutput("");
        setError(false);
        return;
      }

      if (mode === "encode") {
        setOutput(encodeBase64(value));
        setError(false);
      } else {
        if (isValidBase64(value)) {
          setOutput(decodeBase64(value));
          setError(false);
        } else {
          setOutput(value);
          setError(true);
        }
      }
    },
    [mode],
  );

  const handleModeChange = useCallback(
    (m: Mode) => {
      setMode(m);
      setInput("");
      setOutput("");
      setError(false);
      setCopied(false);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (!output || error) return;
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
  }, [output, error]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <LockKeyIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Base64</h1>
            <p className="text-sm text-neutral-500">
              Encode text to Base64 and decode it back
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
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Input
            </span>
          </div>

          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === "encode"
                ? "Type or paste text to encode..."
                : "Paste a Base64 string to decode..."
            }
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Result
              </span>
            </div>

            <div
              className={`flex items-start justify-between gap-4 p-4 rounded-lg bg-black border min-h-14 ${
                error
                  ? "border-red-500/30"
                  : "border-[#262626]"
              }`}
            >
              {!hasInput ? (
                <span className="text-sm text-neutral-600">
                  {mode === "encode"
                    ? "Encoded result will appear here"
                    : "Decoded result will appear here"}
                </span>
              ) : error ? (
                <span className="text-sm text-red-400">
                  Invalid Base64 string
                </span>
              ) : (
                <code className="text-base sm:text-lg font-mono text-[#ededed] break-all select-all whitespace-pre-wrap">
                  {output}
                </code>
              )}
            </div>

            <div className="flex items-center justify-end mt-4">
              <button
                onClick={handleCopy}
                disabled={!output || error}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  copied
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : output && !error
                      ? "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
                      : "bg-[#111] text-neutral-600 border-[#1a1a1a] cursor-not-allowed"
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
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Base64</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Base64 is a binary-to-text encoding scheme that represents binary
              data in an ASCII string format using a set of 64 characters
              (A-Z, a-z, 0-9, +, /).
            </p>
            <p>
              It is commonly used to encode binary data for transmission over
              text-based protocols such as HTTP, email (MIME), and JSON
              (data URLs). Every 3 bytes of binary data are represented as
              4 Base64 characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
