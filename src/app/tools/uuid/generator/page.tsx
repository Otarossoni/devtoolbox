"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FingerprintSimpleIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  generateUUID,
  generateUUIDv3,
  generateUUIDv5,
  NAMESPACE_DNS,
  NAMESPACE_URL,
  NAMESPACE_OID,
  NAMESPACE_X500,
  type UUIDVersion,
} from "@/lib/uuid";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField, Select } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { OutputBox, OutputValue, OutputPlaceholder, Actions } from "@/components/Output";

const versions: {
  value: UUIDVersion;
  label: string;
  description: string;
}[] = [
  { value: "v1", label: "v1", description: "Timestamp + MAC" },
  { value: "v3", label: "v3", description: "MD5 + namespace" },
  { value: "v4", label: "v4", description: "Random" },
  { value: "v5", label: "v5", description: "SHA-1 + namespace" },
  { value: "v6", label: "v6", description: "Reordered timestamp" },
  { value: "v7", label: "v7", description: "Unix timestamp" },
];

const namespaces = [
  { value: NAMESPACE_DNS, label: "DNS" },
  { value: NAMESPACE_URL, label: "URL" },
  { value: NAMESPACE_OID, label: "OID" },
  { value: NAMESPACE_X500, label: "X.500" },
];

const needsInput = (v: UUIDVersion) => v === "v3" || v === "v5";

export default function UUIDGeneratorPage() {
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [uuid, setUuid] = useState("");
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState(NAMESPACE_DNS);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setUuid(generateUUID("v4"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const doGenerate = (v: UUIDVersion, n: string, ns: string) => {
    if (v === "v3") return generateUUIDv3(ns, n);
    if (v === "v5") return generateUUIDv5(ns, n);
    return generateUUID(v);
  };

  const handleGenerate = () => {
    setUuid(doGenerate(version, name, namespace));
    setCopied(false);
  };

  const handleCopy = useCallback(async () => {
    if (!uuid) return;
    try {
      await navigator.clipboard.writeText(uuid);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = uuid;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [uuid]);

  const handleVersionChange = useCallback((v: UUIDVersion) => {
    setVersion(v);
  }, []);

  return (
    <ToolPage>
      <ToolHeader
        icon={FingerprintSimpleIcon}
        title="UUID Generator"
        description="Generate universally unique identifiers"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Version"
          value={version}
          onChange={handleVersionChange}
          options={versions.map((v) => ({
            value: v.value,
            title: v.description,
            label: (
              <>
                <span className="font-mono">{v.label}</span>
                <span className="ml-1.5 hidden text-xs font-normal text-fg-secondary sm:inline">
                  {v.description}
                </span>
              </>
            ),
          }))}
        />

        <div
          className={`overflow-hidden transition-all duration-300 ease-standard ${
            needsInput(version)
              ? "max-h-72 opacity-100"
              : "-mt-4 max-h-0 opacity-0"
          }`}
          aria-hidden={!needsInput(version)}
        >
          <div className="flex flex-col gap-4 rounded-card bg-surface p-card-sm sm:p-card">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="uuid-namespace">Namespace</FieldLabel>
              <Select
                id="uuid-namespace"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                tabIndex={needsInput(version) ? undefined : -1}
              >
                {namespaces.map((ns) => (
                  <option key={ns.label} value={ns.value}>
                    {ns.label}{ns.label === "DNS" ? " (default)" : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="uuid-name">Name</FieldLabel>
              <TextField
                id="uuid-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name..."
                tabIndex={needsInput(version) ? undefined : -1}
              />
              {name && (
                <p className="text-xs text-fg-tertiary">
                  Same namespace + name always produces the same UUID
                </p>
              )}
            </div>
          </div>
        </div>

        <Card label="Result">
          <OutputBox>
            {uuid ? (
              <OutputValue>{uuid}</OutputValue>
            ) : (
              <OutputPlaceholder>
                Click &quot;Generate&quot; to create a UUID
              </OutputPlaceholder>
            )}
          </OutputBox>
          <Actions align="between">
            <CopyButton copied={copied} onClick={handleCopy} disabled={!uuid} />
            <Button variant="primary" size="md" icon={ArrowClockwiseIcon} onClick={handleGenerate}>
              Generate
            </Button>
          </Actions>
        </Card>

        <AboutCard title="About versions">
          <div>
            <span className="font-mono text-accent">v1</span>{" "}
            &mdash; Based on timestamp and MAC address. Useful when
            you need time-based ordering with machine identification.
          </div>
          <div>
            <span className="font-mono text-accent">v3</span>{" "}
            &mdash; Based on MD5 hash of a namespace + name. Deterministic:
            same namespace + name always produces the same UUID.
          </div>
          <div>
            <span className="font-mono text-accent">v4</span>{" "}
            &mdash; Randomly generated. The most common and recommended
            version for most use cases.
          </div>
          <div>
            <span className="font-mono text-accent">v5</span>{" "}
            &mdash; Same as v3, but uses SHA-1 instead of MD5. More secure
            and also deterministic.
          </div>
          <div>
            <span className="font-mono text-accent">v6</span>{" "}
            &mdash; Reordered timestamp for lexicographic sorting.
            Compatible with v1, but better for database indexes.
          </div>
          <div>
            <span className="font-mono text-accent">v7</span>{" "}
            &mdash; Unix timestamp in milliseconds + random bits. Ideal
            for database primary keys.
          </div>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
