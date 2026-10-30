"use client";

import { useState, useCallback } from "react";
import {
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { detectUUIDVersion, type UUIDVersion } from "@/lib/uuid";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextField } from "@/components/Field";
import { OutputBox, OutputValue, OutputPlaceholder } from "@/components/Output";

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
    <ToolPage>
      <ToolHeader
        icon={MagnifyingGlassIcon}
        title="UUID Validator"
        description="Check validity and identify the version of any UUID"
      />

      <CardStack>
        <Card label="Result">
          <TextField
            type="text"
            aria-label="UUID"
            value={input}
            onChange={handleChange}
            placeholder="Paste or type a UUID..."
          />

          <OutputBox>
            {!hasInput ? (
              <OutputPlaceholder>
                Type a UUID to verify
              </OutputPlaceholder>
            ) : valid && version ? (
              <div className="flex w-full items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-segment bg-success-tint">
                  <span className="text-sm font-bold text-success">✓</span>
                </div>
                <OutputValue>{input.trim()}</OutputValue>
              </div>
            ) : (
              <div className="flex w-full items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-segment bg-error-tint">
                  <span className="text-sm font-bold text-error">✗</span>
                </div>
                <OutputValue className="text-fg-tertiary!">{input.trim()}</OutputValue>
              </div>
            )}
          </OutputBox>

          {hasInput && valid && version && (
            <div className="flex items-center gap-2 rounded-control bg-success-tint p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-segment bg-surface/40">
                <span className="text-sm font-bold text-success">✓</span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-success">Valid</span>
                <span className="mx-2 text-sm text-fg-secondary">·</span>
                <span className="font-mono text-sm text-fg">{version}</span>
                <span className="ml-2 text-sm text-fg-secondary">{versionLabels[version]}</span>
              </div>
            </div>
          )}

          {hasInput && !valid && (
            <div className="flex items-center gap-2 rounded-control bg-error-tint p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-segment bg-surface/40">
                <span className="text-sm font-bold text-error">✗</span>
              </div>
              <span className="text-sm font-medium text-error">
                Invalid format
              </span>
            </div>
          )}
        </Card>

        <AboutCard title="About versions">
          <div>
            <span className="font-mono text-accent">v1</span>{" "}
            &mdash; Based on timestamp and MAC address. Useful when
            you need time-based ordering with machine identification.
          </div>
          <div>
            <span className="font-mono text-accent">v3</span>{" "}
            &mdash; Based on MD5 hash of a namespace + name. Deterministic.
          </div>
          <div>
            <span className="font-mono text-accent">v4</span>{" "}
            &mdash; Randomly generated. The most common and recommended
            version for most use cases.
          </div>
          <div>
            <span className="font-mono text-accent">v5</span>{" "}
            &mdash; Same as v3, but uses SHA-1 instead of MD5. More secure.
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
