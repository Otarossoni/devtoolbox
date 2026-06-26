"use client";

import { useState, useCallback } from "react";
import {
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { detectUUIDVersion, type UUIDVersion } from "@/lib/uuid";

const versionLabels: Record<UUIDVersion, string> = {
  v1: "Timestamp + MAC",
  v3: "MD5 + namespace",
  v4: "Random",
  v5: "SHA-1 + namespace",
  v6: "Reordered timestamp",
  v7: "Unix timestamp",
};

export default function UUIDValidatorPage() {
  const [input, setInput] = useState("");
  const [version, setVersion] = useState<UUIDVersion | null>(null);
  const [valid, setValid] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    const trimmed = value.trim();
    if (!trimmed) {
      setValid(false);
      setVersion(null);
      return;
    }

    const detected = detectUUIDVersion(trimmed);
    if (detected) {
      setValid(true);
      setVersion(detected);
    } else {
      setValid(false);
      setVersion(null);
    }
  }, []);

  const hasInput = input.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">UUID Validator</h1>
            <p className="text-sm text-neutral-500">
              Check validity and identify the version of any UUID
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Result
            </span>
          </div>

          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Paste or type a UUID..."
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 mb-4"
          />

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-black border border-[#262626] min-h-14">
            {!hasInput ? (
              <span className="text-sm text-neutral-600">
                Type a UUID to verify
              </span>
            ) : valid && version ? (
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/10 border border-green-500/20 shrink-0">
                  <span className="text-green-400 text-sm font-bold">✓</span>
                </div>
                <code className="text-base sm:text-lg font-mono text-[#ededed] break-all select-all">
                  {input.trim()}
                </code>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 border border-red-500/20 shrink-0">
                  <span className="text-red-400 text-sm font-bold">✗</span>
                </div>
                <code className="text-base sm:text-lg font-mono text-neutral-600 break-all select-all">
                  {input.trim()}
                </code>
              </div>
            )}
          </div>

          {hasInput && valid && version && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/10 border border-green-500/20 shrink-0">
                <span className="text-green-400 text-sm font-bold">✓</span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-green-400 font-medium">Valid</span>
                <span className="text-sm text-neutral-500 mx-2">·</span>
                <span className="text-sm text-[#ededed] font-mono">{version}</span>
                <span className="text-sm text-neutral-500 ml-2">{versionLabels[version]}</span>
              </div>
            </div>
          )}

          {hasInput && !valid && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 border border-red-500/20 shrink-0">
                <span className="text-red-400 text-sm font-bold">✗</span>
              </div>
              <span className="text-sm text-red-400 font-medium">
                Invalid format
              </span>
            </div>
          )}
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About versions</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <div>
              <span className="font-mono text-[#8A2BE2]">v1</span>{" "}
              &mdash; Based on timestamp and MAC address. Useful when
              you need time-based ordering with machine identification.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v3</span>{" "}
              &mdash; Based on MD5 hash of a namespace + name. Deterministic.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v4</span>{" "}
              &mdash; Randomly generated. The most common and recommended
              version for most use cases.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v5</span>{" "}
              &mdash; Same as v3, but uses SHA-1 instead of MD5. More secure.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v6</span>{" "}
              &mdash; Reordered timestamp for lexicographic sorting.
              Compatible with v1, but better for database indexes.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v7</span>{" "}
              &mdash; Unix timestamp in milliseconds + random bits. Ideal
              for database primary keys.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
