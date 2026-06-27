"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  PasswordIcon,
  ArrowClockwiseIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { generatePassword, passwordEntropy } from "@/lib/hash";

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPassword(
      generatePassword(16, { uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: true }),
    );
  }, []);

  const entropy = useMemo(() => passwordEntropy(password, { uppercase, lowercase, numbers, symbols }), [password, uppercase, lowercase, numbers, symbols]);

  const entropyLabel = entropy < 40 ? "Weak" : entropy < 60 ? "Fair" : entropy < 80 ? "Strong" : "Very Strong";
  const entropyColor = entropy < 40 ? "bg-red-500" : entropy < 60 ? "bg-amber-500" : entropy < 80 ? "bg-green-500" : "bg-[#8A2BE2]";

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword(Math.max(8, Math.min(128, length || 8)), { uppercase, lowercase, numbers, symbols, excludeAmbiguous: true }));
    setCopied(false);
  }, [length, uppercase, lowercase, numbers, symbols]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = password;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <PasswordIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Password Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate strong, random passwords
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Options</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider">Length</label>
              <input
                type="text"
                inputMode="numeric"
                value={length}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (e.target.value === "") setLength(0);
                  else if (!isNaN(v)) setLength(v);
                }}
                className="w-16 px-2 py-0.5 rounded-md bg-black border border-[#262626] text-xs font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200 text-center"
              />
            </div>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#171717] border border-[#262626] accent-[#8A2BE2]"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-neutral-600">8</span>
              <span className="text-[10px] text-neutral-600">128</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { key: "uppercase", value: uppercase, set: setUppercase, label: "A-Z" },
              { key: "lowercase", value: lowercase, set: setLowercase, label: "a-z" },
              { key: "numbers", value: numbers, set: setNumbers, label: "0-9" },
              { key: "symbols", value: symbols, set: setSymbols, label: "!@#$%" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => t.set(!t.value)}
                className={`px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer border ${
                  t.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Password</span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-black border border-[#262626] min-h-14 mb-3">
            <code className="text-base sm:text-lg font-mono text-[#ededed] break-all select-all" suppressHydrationWarning>
              {password}
            </code>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Entropy</span>
              <span className="text-xs font-mono text-[#ededed]">{entropy.toFixed(0)} bits · {entropyLabel}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#171717] border border-[#262626] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${entropyColor}`}
                style={{ width: `${Math.min(100, (entropy / 100) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              <ArrowClockwiseIcon className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Password Generator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Passwords are generated using cryptographically secure random
              values via the browser&rsquo;s native Web Crypto API. Nothing
              is stored or transmitted.
            </p>
            <p>
              <strong>Entropy</strong> estimates password strength in bits.
              Weak: below 40, Fair: 40–60, Strong: 60–80, Very Strong: 80+.
              Ambiguous characters (Il1O0) are always excluded to make
              passwords easier to read and type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
