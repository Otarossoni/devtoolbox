"use client";

import { useState, useCallback } from "react";
import { HashStraightIcon } from "@phosphor-icons/react/dist/ssr";
import {
  computeHashSync,
  sha256,
  sha512,
  hashWithHmac,
  type HashAlgorithm,
} from "@/lib/hash";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField, TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button, { ToggleChip } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

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
    <ToolPage>
      <ToolHeader
        icon={HashStraightIcon}
        title="Hash Generator"
        description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes"
      />

      <CardStack>
        <Card label="Input">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash..."
            rows={4}
          />
        </Card>

        <Card label="Algorithm">
          <SegmentedControl
            ariaLabel="Algorithm"
            layout="grid"
            gridClassName="grid-cols-2 sm:grid-cols-4"
            value={algorithm}
            onChange={setAlgorithm}
            options={algorithms.map((a) => ({ value: a.value, label: a.label }))}
          />
          <div className="flex flex-wrap items-center gap-3">
            <ToggleChip mono pressed={useHmac} onClick={() => setUseHmac(!useHmac)}>
              HMAC
            </ToggleChip>
            {useHmac && (
              <TextField
                type="text"
                size="sm"
                aria-label="Secret key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Secret key..."
                className="flex-1"
              />
            )}
          </div>
        </Card>

        <Card
          label="Result"
          actions={
            <Button variant="primary" onClick={handleGenerate}>
              Generate
            </Button>
          }
        >
          <TextArea
            value={output}
            readOnly
            rows={2}
            aria-label="Hash"
            placeholder="Hash will appear here..."
          />
          <Actions>
            <CopyButton copied={copied} onClick={handleCopy} disabled={!output} />
          </Actions>
        </Card>

        <AboutCard title="About Hash Generator">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
