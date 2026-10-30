"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { decodeJWT, type JWTDecoded } from "@/lib/hash";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import CopyButton from "@/components/CopyButton";
import { CodeBlock } from "@/components/Output";
import { Badge } from "@/components/ValueRow";

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
    <ToolPage>
      <ToolHeader
        icon={ShieldCheckIcon}
        title="JWT Decoder"
        description="Decode JSON Web Tokens without verification"
      />

      <CardStack>
        <Card label="Token">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Paste a JWT token...\ne.g. eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"}
            rows={3}
            invalid={hasInput && !!result && !result.valid}
          />
        </Card>

        {hasInput && result && !result.valid && (
          <ErrorCard label="Error">{result.error}</ErrorCard>
        )}

        {hasInput && result?.valid && (
          <>
            <Card label="Status">
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">Valid</Badge>
                {expiration && (
                  <Badge mono tone={expiration.status === "expired" ? "error" : "success"}>
                    {expiration.status === "expired" ? "Expired" : "Valid until"} {formatDate(expiration.date)}
                  </Badge>
                )}
              </div>
            </Card>

            <Card
              label="Header"
              actions={
                <CopyButton
                  variant="inline"
                  copied={false}
                  onClick={() => handleCopy(JSON.stringify(result.header, null, 2))}
                />
              }
            >
              <CodeBlock tone="primary" maxHeight="max-h-48" className="whitespace-pre! break-normal!">
                {JSON.stringify(result.header, null, 2)}
              </CodeBlock>
              {(result.header as Record<string, unknown>)?.alg !== undefined && (
                <p className="text-xs text-fg-tertiary">
                  Algorithm: {String((result.header as Record<string, unknown>).alg)}
                  {((result.header as Record<string, unknown>).typ) !== undefined && ` · Type: ${String((result.header as Record<string, unknown>).typ)}`}
                </p>
              )}
            </Card>

            <Card
              label="Payload"
              actions={
                <CopyButton
                  variant="inline"
                  copied={false}
                  onClick={() => handleCopy(JSON.stringify(result.payload, null, 2))}
                />
              }
            >
              <CodeBlock tone="primary" maxHeight="max-h-80" className="whitespace-pre! break-normal!">
                {JSON.stringify(result.payload, null, 2)}
              </CodeBlock>
              {(result.payload as Record<string, unknown>)?.sub !== undefined && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {["sub", "iss", "iat", "exp", "nbf", "aud"].map((claim) => {
                    const val = (result.payload as Record<string, unknown>)[claim];
                    if (val === undefined) return null;
                    if (claim === "iat" || claim === "exp" || claim === "nbf") {
                      return (
                        <p key={claim} className="text-xs text-fg-tertiary">
                          <span className="font-mono text-fg-secondary">{claim}:</span> {formatDate(val as number)}
                        </p>
                      );
                    }
                    return (
                      <p key={claim} className="text-xs text-fg-tertiary">
                        <span className="font-mono text-fg-secondary">{claim}:</span> {String(val)}
                      </p>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card
              label="Signature"
              actions={
                <CopyButton
                  variant="inline"
                  copied={false}
                  onClick={() => handleCopy(result.signature)}
                />
              }
            >
              <code className="block font-mono text-sm break-all text-fg-secondary select-all">
                {result.signature}
              </code>
              <p className="text-xs text-fg-tertiary [&_strong]:font-semibold [&_strong]:text-fg-secondary">
                The signature is not verified — this tool only decodes the token contents.
                Use the <strong>Hash Generator</strong> with HMAC to manually verify signatures.
              </p>
            </Card>
          </>
        )}

        <AboutCard title="About JWT Decoder">
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
            on the <code>exp</code> claim.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
