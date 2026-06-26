"use client";

import { useState, useCallback } from "react";
import {
  StackIcon,
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { generateUUID, type UUIDVersion } from "@/lib/uuid";

const versions: { value: "v1" | "v4" | "v6" | "v7"; label: string; description: string }[] = [
  { value: "v1", label: "v1", description: "Timestamp + MAC" },
  { value: "v4", label: "v4", description: "Random" },
  { value: "v6", label: "v6", description: "Reordered timestamp" },
  { value: "v7", label: "v7", description: "Unix timestamp" },
];

export default function UUIDBulkPage() {
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [count, setCount] = useState(10);
  const [uuids, setUuids] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const arr: string[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(generateUUID(version));
    }
    setUuids(arr);
    setGenerated(true);
  }, [version, count]);

  const handleCopyAll = useCallback(async () => {
    const text = uuids.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [uuids]);

  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuid-${version}-${count}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids, version, count]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(uuids, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuid-${version}-${count}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids, version, count]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <StackIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bulk UUID Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate multiple UUIDs at once
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Options
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {versions.map((v) => (
              <button
                key={v.value}
                onClick={() => {
                  setVersion(v.value);
                  setGenerated(false);
                }}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer border ${
                  version === v.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                <span className="text-sm font-mono font-medium">{v.label}</span>
                <span className="text-[10px] text-neutral-600">{v.description}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                Count
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setCount(Math.max(1, Math.min(1000, v)));
                }}
                min={1}
                max={1000}
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>

        {generated && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                {uuids.length} UUIDs
              </span>
              <span className="text-xs text-neutral-600">
                {version}
              </span>
            </div>

            <div className="rounded-lg bg-black border border-[#262626] p-3 max-h-80 overflow-auto">
              {uuids.map((id, i) => (
                <code
                  key={i}
                  className={`block px-2 py-1 text-[13px] font-mono select-all rounded ${
                    i % 2 === 1 ? "bg-[#0a0a0a]" : ""
                  }`}
                >
                  <span className="text-neutral-600 mr-2 select-none">
                    {String(i + 1).padStart(String(uuids.length).length, " ")}
                  </span>
                  <span className="text-[#ededed]">{id}</span>
                </code>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
              <button
                onClick={handleCopyAll}
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
                    Copy All
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30 transition-all duration-200 cursor-pointer"
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                .txt
              </button>
              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30 transition-all duration-200 cursor-pointer"
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                .json
              </button>
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Bulk Generator</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Generate up to 1,000 UUIDs in a single click. Useful for test
              fixtures, database seeds, and batch processing.
            </p>
            <p>
              <strong>v4</strong> — random, the most common version.{" "}
              <strong>v7</strong> — Unix timestamp, ideal for database primary
              keys and time-based ordering.{" "}
              <strong>v1 / v6</strong> — timestamp + MAC, ordered and unique.
            </p>
            <p>
              Export as <strong>.txt</strong> (one per line) or{" "}
              <strong>.json</strong> (array). Click a UUID to manually copy or
              use <strong>Copy All</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
