"use client";

import { useState, useMemo } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { validateBase64, getBase64Preview } from "@/lib/base64";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextArea } from "@/components/Field";
import { CodeBlock } from "@/components/Output";
import { ValueRow } from "@/components/ValueRow";

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
    <ToolPage>
      <ToolHeader
        icon={CheckCircleIcon}
        title="Base64 Validator"
        description="Validate and inspect Base64 strings"
      />

      <CardStack>
        <Card label="Input">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a Base64 string..."
            rows={4}
            invalid={hasInput && !!result && !result.valid}
          />
        </Card>

        {hasInput && result && (
          <>
            <Card label="Status">
              <div
                className={`flex items-center gap-3 rounded-control p-4 ${
                  result.valid ? "bg-success-tint" : "bg-error-tint"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-segment bg-surface/40 ${
                    result.valid ? "text-success" : "text-error"
                  }`}
                >
                  {result.valid ? "✓" : "✗"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    result.valid ? "text-success" : "text-error"
                  }`}
                >
                  {result.valid ? "Valid" : "Invalid"}
                </span>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="pl-2 text-xs text-error">
                      • {err}
                    </p>
                  ))}
                </div>
              )}
            </Card>

            <Card label="Details">
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
                      : "text-warning"
                  }
                />
                <Row
                  label="Data URI"
                  value={result.isDataURI ? `Yes · ${result.mime}` : "No"}
                />
                <Row
                  label="URL-safe"
                  value={result.isURLSafe ? "Yes" : "No"}
                  valueColor={result.isURLSafe ? "text-success" : ""}
                />
              </div>
            </Card>

            {preview && !preview.isBinary && (
              <Card label="Text preview">
                <CodeBlock tone="primary" maxHeight="max-h-40">
                  {preview.text}
                  {preview.text.length >= 200 && "..."}
                </CodeBlock>
              </Card>
            )}

            {preview && preview.isBinary && (
              <Card>
                <div className="py-4 text-center">
                  <span className="text-sm text-fg-secondary">
                    Binary content — preview not available
                  </span>
                </div>
              </Card>
            )}
          </>
        )}

        <AboutCard title="About Base64 Validation">
          <p>
            Paste any Base64 string to check its validity and inspect its
            structure. The validator detects invalid characters, padding
            errors, and estimates the decoded file size.
          </p>
          <p>
            <strong>Data URI</strong> — detects if the string is a full{" "}
            <code>data:...;base64,...</code>{" "}
            format and extracts the MIME type.{" "}
            <strong>URL-safe</strong> — checks if the string uses{" "}
            <code>-_</code> instead of{" "}
            <code>+/</code>.
          </p>
          <p>
            A text preview is shown when the decoded content is readable
            plain text. Binary files show a &ldquo;not available&rdquo; message.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
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
  return <ValueRow label={label} value={value} valueClassName={valueColor} />;
}
