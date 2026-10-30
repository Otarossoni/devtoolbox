"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, ErrorCard } from "@/components/Card";
import { TextField, TextArea } from "@/components/Field";
import Button, { IconButton } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { OutputBox, Actions } from "@/components/Output";
import { ValueRow } from "@/components/ValueRow";

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
    <ToolPage>
      <ToolHeader
        icon={MagnifyingGlassIcon}
        title="URL Parser"
        description="Decompose and inspect any URL"
      />

      <CardStack>
        <Card
          label="URL"
          actions={
            <Button variant="primary" onClick={handleParse}>
              Parse
            </Button>
          }
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Paste a URL...\ne.g. https://user:pass@example.com:8080/path?q=1&sort=asc#section"}
            rows={2}
            invalid={hasInput && !url}
          />
        </Card>

        {hasInput && !url && (
          <ErrorCard>Invalid URL</ErrorCard>
        )}

        {url && (
          <>
            <Card label="Structure">
              <div className="space-y-2">
                {url.protocol && <Row label="Protocol" value={url.protocol.replace(":", "")} />}
                {url.username && <Row label="Username" value={url.username} />}
                {url.password && <Row label="Password" value={"••••••••"} />}
                <Row label="Host" value={url.hostname} />
                {url.port && <Row label="Port" value={url.port} />}
                <Row label="Path" value={url.pathname || "/"} />
                {url.search && <Row label="Query" value={url.search} />}
                {url.hash && <Row label="Hash" value={url.hash} />}
              </div>
            </Card>

            <Card
              label="Query Params"
              actions={
                <Button icon={PlusIcon} onClick={() => setParams([...params, { key: "", value: "" }])}>
                  Add
                </Button>
              }
            >
              {params.length > 0 ? (
                <div className="space-y-2">
                  {params.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <TextField
                        size="sm"
                        aria-label={`Parameter ${i + 1} key`}
                        value={p.key}
                        onChange={(e) => {
                          const next = [...params];
                          next[i] = { ...next[i], key: e.target.value };
                          setParams(next);
                        }}
                        placeholder="key"
                      />
                      <TextField
                        size="sm"
                        aria-label={`Parameter ${i + 1} value`}
                        value={p.value}
                        onChange={(e) => {
                          const next = [...params];
                          next[i] = { ...next[i], value: e.target.value };
                          setParams(next);
                        }}
                        placeholder="value"
                      />
                      <IconButton
                        icon={XIcon}
                        size="sm"
                        label={`Remove parameter ${i + 1}`}
                        onClick={() => setParams(params.filter((_, j) => j !== i))}
                        className="hover:text-error"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <span className="text-sm text-fg-secondary">No query parameters</span>
                </div>
              )}
            </Card>

            {params.length > 0 && (
              <Card label="Reconstructed">
                <OutputBox>
                  <code className="font-mono text-sm break-all text-fg select-all">{reconstructed}</code>
                </OutputBox>
                <Actions>
                  <CopyButton copied={copied} onClick={() => handleCopy(reconstructed)} />
                </Actions>
              </Card>
            )}
          </>
        )}

        <AboutCard title="About URL Parser">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <ValueRow label={label} value={value} truncate valueClassName="max-w-[60%]" />;
}
