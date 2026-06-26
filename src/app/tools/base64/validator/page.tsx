"use client";

import { useState, useMemo } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { validateBase64, getBase64Preview } from "@/lib/base64";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Base64ValidatorPage() {
  const [input, setInput] = useState("");

  const result = useMemo(() => (input.trim() ? validateBase64(input) : null), [input]);
  const preview = useMemo(
    () => (result?.valid && !result.mime?.startsWith("image/") && !result.mime?.startsWith("application/pdf")
      ? getBase64Preview(input, 200)
      : null),
    [input, result],
  );

  const hasInput = input.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <CheckCircleIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Base64 Validator</h1>
            <p className="text-sm text-neutral-500">
              Validate and inspect Base64 strings
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
            placeholder="Paste a Base64 string..."
            rows={4}
            className={`w-full px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 resize-none ${
              hasInput && result
                ? result.valid
                  ? "border-green-500/50"
                  : "border-red-500/50"
                : "border-[#262626] focus:border-[#8A2BE2]"
            }`}
          />
        </div>

        {hasInput && result && (
          <>
            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Status
                </span>
              </div>

              <div
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  result.valid
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-md border shrink-0 ${
                    result.valid
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {result.valid ? "✓" : "✗"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    result.valid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.valid ? "Valid" : "Invalid"}
                </span>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400 pl-2">
                      • {err}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Details
                </span>
              </div>

              <div className="space-y-2">
                <Row label="Characters" value={result.chars.toLocaleString()} />
                <Row
                  label="Decoded size"
                  value={`~${formatSize(result.decodedSize)}`}
                />
                <Row
                  label="Padding"
                  value={
                    result.padding === "correct"
                      ? "Correct"
                      : result.padding === "missing"
                        ? "Missing"
                        : result.padding === "excess"
                          ? "Excess"
                          : "None"
                  }
                  valueColor={
                    result.padding === "correct" || result.padding === "none"
                      ? ""
                      : "text-amber-400"
                  }
                />
                <Row
                  label="Data URI"
                  value={result.isDataURI ? `Yes · ${result.mime}` : "No"}
                />
                <Row
                  label="URL-safe"
                  value={result.isURLSafe ? "Yes" : "No"}
                  valueColor={result.isURLSafe ? "text-green-400" : ""}
                />
              </div>
            </div>

            {preview && !preview.isBinary && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">
                    Text preview
                  </span>
                </div>

                <pre className="rounded-lg bg-black border border-[#262626] p-4 text-sm font-mono text-[#ededed] whitespace-pre-wrap break-all max-h-40 overflow-auto">
                  {preview.text}
                  {preview.text.length >= 200 && "..."}
                </pre>
              </div>
            )}

            {preview && preview.isBinary && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="text-center py-4">
                  <span className="text-sm text-neutral-500">
                    Binary content — preview not available
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Base64 Validation</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Paste any Base64 string to check its validity and inspect its
              structure. The validator detects invalid characters, padding
              errors, and estimates the decoded file size.
            </p>
            <p>
              <strong>Data URI</strong> — detects if the string is a full{" "}
              <code className="text-xs text-neutral-500">data:...;base64,...</code>{" "}
              format and extracts the MIME type.{" "}
              <strong>URL-safe</strong> — checks if the string uses{" "}
              <code className="text-xs text-neutral-500">-_</code> instead of{" "}
              <code className="text-xs text-neutral-500">+/</code>.
            </p>
            <p>
              A text preview is shown when the decoded content is readable
              plain text. Binary files show a &ldquo;not available&rdquo; message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueColor = "",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className={`text-sm font-mono text-[#ededed] ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}
