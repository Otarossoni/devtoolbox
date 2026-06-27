"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";

export default function URLParserPage() {
  const [input, setInput] = useState("");
  const [params, setParams] = useState<{ key: string; value: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    try { return new URL(input.trim()); } catch { return null; }
  }, [input]);

  const reconstructed = useMemo(() => {
    if (!url) return "";
    const u = new URL(url.toString());
    u.search = "";
    for (const p of params) {
      if (p.key) u.searchParams.append(p.key, p.value);
    }
    return u.toString();
  }, [url, params]);

  const handleParse = useCallback(() => {
    if (url) {
      setParams(
        Array.from(url.searchParams.entries()).map(([key, value]) => ({ key, value })),
      );
    }
  }, [url]);

  const handleCopy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-lg font-semibold">URL Parser</h1>
            <p className="text-sm text-neutral-500">
              Decompose and inspect any URL
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">URL</span>
            <button
              onClick={handleParse}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              Parse
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a URL...&#10;e.g. https://user:pass@example.com:8080/path?q=1&sort=asc#section"
            rows={2}
            className={`w-full px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 resize-none ${
              hasInput && !url ? "border-red-500/50" : "border-[#262626] focus:border-[#8A2BE2]"
            }`}
          />
        </div>

        {hasInput && !url && (
          <div className="animate-9 rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-4">
            <span className="text-sm text-red-400">Invalid URL</span>
          </div>
        )}

        {url && (
          <>
            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Structure</span>
              </div>

              <div className="space-y-2">
                {url.protocol && <Row label="Protocol" value={url.protocol.replace(":", "")} />}
                {url.username && <Row label="Username" value={url.username} />}
                {url.password && <Row label="Password" value={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"} />}
                <Row label="Host" value={url.hostname} />
                {url.port && <Row label="Port" value={url.port} />}
                <Row label="Path" value={url.pathname || "/"} />
                {url.search && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
                    <span className="text-xs text-neutral-500">Query</span>
                    <code className="text-sm font-mono text-[#ededed] text-right max-w-[60%] truncate">{url.search}</code>
                  </div>
                )}
                {url.hash && <Row label="Hash" value={url.hash} />}
              </div>
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Query Params
                </span>
                <button
                  onClick={() => setParams([...params, { key: "", value: "" }])}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer"
                >
                  <PlusIcon className="h-3 w-3" /> Add
                </button>
              </div>

              {params.length > 0 ? (
                <div className="space-y-2">
                  {params.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={p.key}
                        onChange={(e) => {
                          const next = [...params];
                          next[i] = { ...next[i], key: e.target.value };
                          setParams(next);
                        }}
                        placeholder="key"
                        className="flex-1 px-3 py-1.5 rounded-md bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                      />
                      <input
                        value={p.value}
                        onChange={(e) => {
                          const next = [...params];
                          next[i] = { ...next[i], value: e.target.value };
                          setParams(next);
                        }}
                        placeholder="value"
                        className="flex-1 px-3 py-1.5 rounded-md bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
                      />
                      <button
                        onClick={() => setParams(params.filter((_, j) => j !== i))}
                        className="px-2 text-neutral-500 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-sm text-neutral-500">No query parameters</span>
                </div>
              )}
            </div>

            {params.length > 0 && (
              <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Reconstructed</span>
                </div>

                <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-black border border-[#262626]">
                  <code className="text-sm font-mono text-[#ededed] break-all select-all">{reconstructed}</code>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={() => handleCopy(reconstructed)}
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
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About URL Parser</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Paste any URL to decompose it into its structural parts. The
              parser extracts protocol, host, port, path, query string, and
              hash fragment using the browser&rsquo;s native URL API.
            </p>
            <p>
              <strong>Query Params</strong> — edit, add, or remove individual
              key-value pairs. The reconstructed URL updates live and can be
              copied to clipboard. All processing happens locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#262626]">
      <span className="text-xs text-neutral-500 min-w-20">{label}</span>
      <code className="text-sm font-mono text-[#ededed] text-right max-w-[60%] truncate">{value}</code>
    </div>
  );
}
