"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  DownloadSimpleIcon,
  FileIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel, CardMeta } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import DropZone from "@/components/DropZone";
import { OutputBox, Actions } from "@/components/Output";

type Mode = "encode" | "decode";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function base64ToBlobUrl(base64: string, mime: string): string {
  const dataUrl = base64.startsWith("data:")
    ? base64
    : `data:${mime};base64,${base64}`;
  const base64Data = dataUrl.split(",")[1] || "";
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

function extractMime(base64: string): string {
  const match = base64.trim().match(/^data:([^;]+)/);
  return match ? match[1] : "application/octet-stream";
}

export default function Base64FilePage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Each mode keeps its own state so switching modes preserves input
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [encodedBase64, setEncodedBase64] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodedSrc, setDecodedSrc] = useState("");
  const [decodedMime, setDecodedMime] = useState("");
  const [decodedSize, setDecodedSize] = useState(0);
  const [decodedReady, setDecodedReady] = useState(false);
  const [decodeError, setDecodeError] = useState(false);
  const decodedBlobRef = useRef("");

  const base64 = mode === "encode" ? encodedBase64 : decodeInput;
  const error = mode === "decode" && decodeError;

  useEffect(() => {
    const decoded = decodedBlobRef;
    return () => {
      if (decoded.current) URL.revokeObjectURL(decoded.current);
    };
  }, []);

  const revokeBlob = useCallback(() => {
    if (decodedBlobRef.current) {
      URL.revokeObjectURL(decodedBlobRef.current);
      decodedBlobRef.current = "";
    }
  }, []);

  // ---- Encode ----

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      setEncodedBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ---- Decode ----

  const handleDecodeInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setDecodeInput(value);
      revokeBlob();

      const trimmed = value.trim();
      if (!trimmed) {
        setDecodedSrc("");
        setDecodedReady(false);
        setDecodeError(false);
        return;
      }

      try {
        const mime = extractMime(trimmed);
        const url = base64ToBlobUrl(trimmed, mime);
        decodedBlobRef.current = url;
        setDecodedSrc(url);
        setDecodedMime(mime);
        const base64Part = trimmed.split(",")[1] || trimmed;
        setDecodedSize(Math.round((base64Part.length * 3) / 4));
        setDecodedReady(true);
        setDecodeError(false);
      } catch {
        setDecodedSrc("");
        setDecodedReady(false);
        setDecodeError(true);
      }
    },
    [revokeBlob],
  );

  // ---- Common ----

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!base64) return;
    try {
      await navigator.clipboard.writeText(base64);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = base64;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [base64]);

  const handleDownload = useCallback(() => {
    if (!decodedSrc) return;
    const a = document.createElement("a");
    a.href = decodedSrc;
    a.download = "file";
    a.click();
  }, [decodedSrc]);

  return (
    <ToolPage>
      <ToolHeader
        icon={FileIcon}
        title="Base64 File"
        description="Encode any file to Base64 and decode it back"
      />

      <CardStack>
        <SegmentedControl
          ariaLabel="Mode"
          value={mode}
          onChange={handleModeChange}
          options={[
            { value: "encode", label: "Encode", icon: LockKeyIcon },
            { value: "decode", label: "Decode", icon: LockKeyOpenIcon },
          ]}
        />

        <Card
          label={mode === "encode" ? "Upload" : "Base64 Input"}
          actions={
            mode === "encode" && fileName ? (
              <CardMeta>{formatSize(fileSize)}</CardMeta>
            ) : undefined
          }
        >
          {mode === "encode" ? (
            <>
              <DropZone
                isDragging={isDragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                icon={FileIcon}
                loaded={!!fileName}
                title={fileName || "Drop any file here or click to browse"}
                meta={fileName ? `${formatSize(fileSize)} · Click or drop to change` : undefined}
              />

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <TextArea
              value={base64}
              onChange={handleDecodeInput}
              placeholder="Paste a Base64 string..."
              rows={3}
            />
          )}

          {error && (
            <div className="flex items-center justify-center rounded-control bg-error-tint p-4">
              <span className="text-sm text-error">
                Invalid Base64 string
              </span>
            </div>
          )}

          {mode === "encode" && base64 && (
            <>
              <FieldLabel>Result</FieldLabel>

              <OutputBox>
                <code className="line-clamp-3 font-mono text-xs break-all text-fg select-all">
                  {base64.substring(0, 200)}
                  {base64.length > 200 && "..."}
                </code>
              </OutputBox>

              <Actions>
                <CopyButton copied={copied} onClick={handleCopy} />
              </Actions>
            </>
          )}

          {mode === "decode" && decodedReady && (
            <>
              <FieldLabel>Decoded file</FieldLabel>

              <div className="flex items-center gap-3 rounded-control bg-surface-elevated p-4">
                <FileIcon className="size-6 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-sm text-fg">
                    {decodedMime}
                  </span>
                  <span className="text-xs text-fg-secondary">
                    ~{formatSize(decodedSize)} decoded
                  </span>
                </div>
              </div>

              <Actions>
                <Button variant="primary" size="md" icon={DownloadSimpleIcon} onClick={handleDownload}>
                  Download
                </Button>
              </Actions>
            </>
          )}
        </Card>

        <AboutCard title="About Base64 File">
          <p>
            Encode any file type to a Base64 string or decode a Base64
            string back to its original file. No file size limits — but
            very large files may be slow to encode.
          </p>
          <p>
            Encoding: drop or select any file to get its{" "}
            <code>data:...;base64,...</code>{" "}
            string. Decoding: paste a Base64 string to download the
            reconstructed file.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
