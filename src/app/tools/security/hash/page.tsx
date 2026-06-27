"use client";

import { useState, useCallback } from "react";
import { HashStraightIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import {
  computeHashSync,
  sha256,
  sha512,
  hashWithHmac,
  type HashAlgorithm,
} from "@/lib/hash";

const algorithms: { value: HashAlgorithm; label: string; isAsync: boolean }[] = [
  { value: "md5", label: "MD5", isAsync: false },
  { value: "sha1", label: "SHA-1", isAsync: false },
  { value: "sha256", label: "SHA-256", isAsync: true },
  { value: "sha512", label: "SHA-512", isAsync: true },
];

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");
  const [output, setOutput] = useState("");
  const [useHmac, setUseHmac] = useState(false);
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!input) { setOutput(""); return; }
    try {
      if (useHmac && key) {
        const algo = algorithm === "sha256" ? "SHA-256" : algorithm === "sha512" ? "SHA-512" : "SHA-256";
        const hash = await hashWithHmac(input, key, algo);
        setOutput(hash);
      } else if (algorithm === "sha256") {
        setOutput(await sha256(input));
      } else if (algorithm === "sha512") {
        setOutput(await sha512(input));
      } else {
        setOutput(computeHashSync(input, algorithm));
      }
    } catch {
      setOutput("");
    }
  }, [input, algorithm, useHmac, key]);

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
            <HashStraightIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Hash Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate MD5, SHA-1, SHA-256, and SHA-512 hashes
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
            placeholder="Type or paste text to hash..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Algorithm</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {algorithms.map((a) => (
              <button
                key={a.value}
                onClick={() => setAlgorithm(a.value)}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer border ${
                  algorithm === a.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseHmac(!useHmac)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer border ${
                useHmac
                  ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                  : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
              }`}
            >
              HMAC
            </button>
            {useHmac && (
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Secret key..."
                className="flex-1 px-3 py-1 rounded-md bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            )}
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Result</span>
            <button
              onClick={handleGenerate}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              Generate
            </button>
          </div>

          <textarea
            value={output}
            readOnly
            rows={2}
            placeholder="Hash will appear here..."
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none resize-none"
          />

          <div className="flex items-center justify-end mt-4">
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                copied
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : output
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

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Hash Generator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Generate cryptographic and non-cryptographic hashes from any
              input text. MD5 and SHA-1 run synchronously, SHA-256 and
              SHA-512 use the browser&rsquo;s native Web Crypto API.
            </p>
            <p>
              Enable <strong>HMAC</strong> to create keyed-hash message
              authentication codes — requires a secret key. HMAC is only
              available with SHA-256 and SHA-512.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
