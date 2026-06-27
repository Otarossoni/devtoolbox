"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ShieldCheckIcon,
  CopyIcon,
} from "@phosphor-icons/react/dist/ssr";
import { decodeJWT, type JWTDecoded } from "@/lib/hash";

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export default function JWTDecoderPage() {
  const [input, setInput] = useState("");

  const result: JWTDecoded | null = useMemo(() => {
    if (!input.trim()) return null;
    return decodeJWT(input.trim());
  }, [input]);

  const expiration = useMemo(() => {
    if (!result?.valid || !result.payload) return null;
    const p = result.payload as Record<string, unknown>;
    if (typeof p.exp === "number") {
      // eslint-disable-next-line react-hooks/purity
      return p.exp * 1000 < Date.now() ? { status: "expired", date: p.exp } : { status: "valid", date: p.exp };
    }
    return null;
  }, [result]);

  const handleCopy = useCallback(async (text: string) => {
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
  }, []);

  const hasInput = input.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <ShieldCheckIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">JWT Decoder</h1>
            <p className="text-sm text-neutral-500">
              Decode JSON Web Tokens without verification
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Token</span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a JWT token...&#10;e.g. eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
            rows={3}
            className={`w-full px-4 py-2.5 rounded-lg bg-black border text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none transition-colors duration-200 resize-none ${
              hasInput && result
                ? result.valid
                  ? "border-green-500/50"
                  : "border-red-500/50"
                : "border-[#262626] focus:border-[#8A2BE2]"
            }`}
          />
        </div>

        {hasInput && result && !result.valid && (
          <div className="animate-9 rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-red-400 uppercase tracking-wider">Error</span>
            </div>
            <span className="text-sm text-red-400 font-mono">{result.error}</span>
          </div>
        )}

        {hasInput && result?.valid && (
          <>
            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Status</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  Valid
                </span>
                {expiration && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border ${
                    expiration.status === "expired"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}>
                    {expiration.status === "expired" ? "Expired" : "Valid until"} {formatDate(expiration.date)}
                  </span>
                )}
              </div>
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Header</span>
              </div>

              <pre className="rounded-lg bg-black border border-[#262626] p-3 text-sm font-mono text-[#ededed] overflow-auto max-h-48">
                {JSON.stringify(result.header, null, 2)}
              </pre>

              <div className="flex items-center justify-end mt-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(result.header, null, 2))}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-500 hover:text-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                >
                  <CopyIcon className="h-3 w-3" /> Copy
                </button>
              </div>

              {(result.header as Record<string, unknown>)?.alg !== undefined && (
                <p className="text-xs text-neutral-600 mt-2">
                  Algorithm: {String((result.header as Record<string, unknown>).alg)}
                  {((result.header as Record<string, unknown>).typ) !== undefined && ` · Type: ${String((result.header as Record<string, unknown>).typ)}`}
                </p>
              )}
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Payload</span>
              </div>

              <pre className="rounded-lg bg-black border border-[#262626] p-3 text-sm font-mono text-[#ededed] overflow-auto max-h-80">
                {JSON.stringify(result.payload, null, 2)}
              </pre>

              <div className="flex items-center justify-end mt-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(result.payload, null, 2))}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-500 hover:text-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                >
                  <CopyIcon className="h-3 w-3" /> Copy
                </button>
              </div>

              {(result.payload as Record<string, unknown>)?.sub !== undefined && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {["sub", "iss", "iat", "exp", "nbf", "aud"].map((claim) => {
                    const val = (result.payload as Record<string, unknown>)[claim];
                    if (val === undefined) return null;
                    if (claim === "iat" || claim === "exp" || claim === "nbf") {
                      return (
                        <p key={claim} className="text-xs text-neutral-600">
                          <span className="text-neutral-500 font-mono">{claim}:</span> {formatDate(val as number)}
                        </p>
                      );
                    }
                    return (
                      <p key={claim} className="text-xs text-neutral-600">
                        <span className="text-neutral-500 font-mono">{claim}:</span> {String(val)}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Signature</span>
              </div>

              <code className="block text-sm font-mono text-neutral-400 break-all select-all">
                {result.signature}
              </code>

              <div className="flex items-center justify-end mt-2">
                <button
                  onClick={() => handleCopy(result.signature)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-500 hover:text-[#8A2BE2] transition-colors duration-200 cursor-pointer"
                >
                  <CopyIcon className="h-3 w-3" /> Copy
                </button>
              </div>

              <p className="text-xs text-neutral-600 mt-2">
                The signature is not verified — this tool only decodes the token contents.
                Use the <strong>Hash Generator</strong> with HMAC to manually verify signatures.
              </p>
            </div>
          </>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About JWT Decoder</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Decode JSON Web Tokens into their constituent parts: header
              (algorithm and type), payload (claims and data), and signature.
              No verification is performed — this tool only inspects the
              token structure.
            </p>
            <p>
              The decoder highlights standard claims (sub, iss, iat, exp,
              nbf, aud) and converts timestamps to human-readable dates. The
              expiration status shows whether the token is still valid based
              on the <code className="text-xs text-neutral-500">exp</code> claim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
