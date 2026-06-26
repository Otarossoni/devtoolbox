"use client";

import { useState, useMemo } from "react";
import {
  FingerprintSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  isValidUUID,
  detectUUIDVersion,
  getUUIDVariant,
  extractUUIDTimestamp,
  extractUUIDNode,
  extractUUIDClockSeq,
  isNilUUID,
  uuidToHexBytes,
  type UUIDVersion,
} from "@/lib/uuid";

const STRUCTURE_COLORS = [
  "bg-purple-500/20 border-purple-500/30 text-purple-400",
  "bg-blue-500/20 border-blue-500/30 text-blue-400",
  "bg-green-500/20 border-green-500/30 text-green-400",
  "bg-amber-500/20 border-amber-500/30 text-amber-400",
  "bg-pink-500/20 border-pink-500/30 text-pink-400",
];

const groups = (uuid: string) => {
  const clean = uuid.replace(/-/g, "");
  return [
    clean.slice(0, 8),
    clean.slice(8, 12),
    clean.slice(12, 16),
    clean.slice(16, 20),
    clean.slice(20, 32),
  ];
};

const groupLabels = (version: UUIDVersion | null) => {
  if (version === "v1" || version === "v6") {
    return version === "v6"
      ? ["time_high", "time_mid", "ver + time_low", "var + clk_seq", "node"]
      : ["time_low", "time_mid", "ver + time_hi", "var + clk_seq", "node"];
  }
  return ["field 0", "field 1", "ver + field 2", "var + field 3", "field 4"];
};

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export default function UUIDInspectorPage() {
  const [input, setInput] = useState("");

  const valid = useMemo(() => isValidUUID(input.trim()), [input]);
  const version = useMemo(() => detectUUIDVersion(input.trim()), [input]);
  const nil = useMemo(() => isNilUUID(input.trim()), [input]);
  const variant = useMemo(
    () => (valid ? getUUIDVariant(input.trim()) : null),
    [input, valid],
  );
  const timestamp = useMemo(
    () => (valid && version ? extractUUIDTimestamp(input.trim(), version) : null),
    [input, valid, version],
  );
  const node = useMemo(
    () => (valid ? extractUUIDNode(input.trim()) : null),
    [input, valid],
  );
  const clockSeq = useMemo(
    () => (valid ? extractUUIDClockSeq(input.trim()) : null),
    [input, valid],
  );
  const hexBytes = useMemo(
    () => (valid ? uuidToHexBytes(input.trim()) : ""),
    [input, valid],
  );

  const hasInput = input.trim().length > 0;
  const grp = groups(input.trim());

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <FingerprintSimpleIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">UUID Inspector</h1>
            <p className="text-sm text-neutral-500">
              Decode and analyze any UUID
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              UUID
            </span>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a UUID..."
            className={`w-full px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 ${
              hasInput
                ? valid
                  ? "border-green-500/50"
                  : "border-red-500/50"
                : "border-[#262626] focus:border-[#8A2BE2]"
            }`}
          />

          {hasInput && !valid && (
            <p className="text-xs text-red-400 mt-2">Invalid UUID format</p>
          )}
        </div>

        {hasInput && valid && (
          <>
            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Summary
                </span>
              </div>

              <code className="block text-base font-mono text-[#ededed] mb-3 break-all select-all">
                {input.trim()}
              </code>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  Valid
                </span>
                {version && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-[#8A2BE2]/10 text-[#8A2BE2] border border-[#8A2BE2]/20">
                    {version}
                  </span>
                )}
                {variant && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-[#171717] text-neutral-400 border border-[#262626]">
                    {variant}
                  </span>
                )}
                {nil && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                    Nil UUID
                  </span>
                )}
              </div>
            </div>

            {(version === "v1" || version === "v6" || version === "v7") &&
              timestamp && (
                <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">
                      Timestamp
                    </span>
                  </div>

                  <p className="text-lg font-mono text-[#ededed] mb-2">
                    {formatDate(timestamp.date)}
                  </p>

                  <p className="text-xs text-neutral-600">
                    {version === "v7"
                      ? `Unix ms: ${timestamp.ts.toLocaleString()}`
                      : `Unix ms: ${timestamp.ts.toLocaleString()}  ·  100-ns intervals since 1582-10-15`}
                  </p>
                </div>
              )}

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Structure
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1 font-mono text-lg mb-4">
                {grp.map((g, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="text-neutral-600 mx-0.5">-</span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded border ${STRUCTURE_COLORS[i]}`}
                    >
                      {g}
                    </span>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {groupLabels(version).map((label, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono border ${STRUCTURE_COLORS[i]}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Raw bytes
                </span>
              </div>

              <code className="block text-sm font-mono text-[#ededed] break-all select-all">
                {hexBytes}
              </code>
            </div>

            {(version === "v1" || version === "v6") && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Details
                  </span>
                </div>

                <div className="space-y-3">
                  {clockSeq !== null && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
                      <span className="text-xs text-neutral-500">
                        Clock sequence
                      </span>
                      <code className="text-sm font-mono text-[#ededed]">
                        {clockSeq.toLocaleString()}
                      </code>
                    </div>
                  )}
                  {node && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
                      <span className="text-xs text-neutral-500">Node</span>
                      <code className="text-sm font-mono text-[#ededed]">
                        {node}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About UUID Inspector</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Paste any UUID to decode its internal structure. The inspector
              shows the version, variant, raw bytes, and extracts timestamps
              for time-based UUIDs.
            </p>
            <p>
              <strong>v1 / v6</strong> — timestamp (100-ns intervals since
              1582), clock sequence, and MAC address.{" "}
              <strong>v7</strong> — Unix timestamp in milliseconds.
            </p>
            <p>
              <strong>v3 / v5</strong> — hash-based, the version and variant
              are detected but no embedded data can be extracted.{" "}
              <strong>v4</strong> — random, no embedded information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
