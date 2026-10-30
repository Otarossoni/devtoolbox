"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  DownloadSimpleIcon,
  FilePdfIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import DropZone from "@/components/DropZone";
import { OutputBox, Actions } from "@/components/Output";

type Mode = "encode" | "decode";

function base64ToBlobUrl(base64: string): string {
  const dataUrl = base64.startsWith("data:")
    ? base64
    : `data:application/pdf;base64,${base64}`;
  const base64Data = dataUrl.split(",")[1] || "";
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export default function Base64PdfPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Each mode keeps its own state (and blob URL) so switching modes preserves input
  const [fileName, setFileName] = useState("");
  const [encodedBase64, setEncodedBase64] = useState("");
  const [encodedSrc, setEncodedSrc] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodedSrc, setDecodedSrc] = useState("");
  const [decodeError, setDecodeError] = useState(false);
  const encodedBlobRef = useRef("");
  const decodedBlobRef = useRef("");

  const base64 = mode === "encode" ? encodedBase64 : decodeInput;
  const pdfSrc = mode === "encode" ? encodedSrc : decodedSrc;
  const error = mode === "decode" && decodeError;

  useEffect(() => {
    const encoded = encodedBlobRef;
    const decoded = decodedBlobRef;
    return () => {
      if (encoded.current) URL.revokeObjectURL(encoded.current);
      if (decoded.current) URL.revokeObjectURL(decoded.current);
    };
  }, []);

  const revokeBlob = useCallback((ref: React.RefObject<string>) => {
    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = "";
    }
  }, []);

  // ---- Encode: file upload ----

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    revokeBlob(encodedBlobRef);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setEncodedBase64(dataUrl);
      const url = base64ToBlobUrl(dataUrl);
      encodedBlobRef.current = url;
      setEncodedSrc(url);
    };
    reader.readAsDataURL(file);
  }, [revokeBlob]);

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
      if (file?.type === "application/pdf" || file?.name.endsWith(".pdf")) {
        processFile(file);
      }
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

  // ---- Decode: base64 input ----

  const handleDecodeInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setDecodeInput(value);
      revokeBlob(decodedBlobRef);

      const trimmed = value.trim();
      if (!trimmed) {
        setDecodedSrc("");
        setDecodeError(false);
        return;
      }

      try {
        const url = base64ToBlobUrl(trimmed);
        decodedBlobRef.current = url;
        setDecodedSrc(url);
        setDecodeError(false);
      } catch {
        setDecodedSrc("");
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
    a.download = "document.pdf";
    a.click();
  }, [decodedSrc]);

  return (
    <ToolPage>
      <ToolHeader
        icon={FilePdfIcon}
        title="Base64 PDF"
        description="Encode PDF files to Base64 and decode them back"
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

        <Card label={mode === "encode" ? "Upload" : "Base64 Input"}>
          {mode === "encode" ? (
            <>
              <DropZone
                isDragging={isDragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                icon={FilePdfIcon}
                loaded={!!fileName}
                title={fileName || "Drop a PDF here or click to browse"}
                meta={fileName ? "Click or drop to change" : undefined}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <TextArea
              value={base64}
              onChange={handleDecodeInput}
              placeholder="Paste a Base64 PDF string..."
              rows={3}
            />
          )}

          {(pdfSrc || error) && (
            <>
              <FieldLabel>Preview</FieldLabel>

              <div
                className={`flex min-h-[100px] items-center justify-center rounded-control p-2 ${
                  error ? "bg-field-error" : "bg-field"
                }`}
              >
                {error ? (
                  <span className="text-sm text-error">
                    {mode === "decode"
                      ? "Invalid Base64 PDF string"
                      : "Failed to process PDF"}
                  </span>
                ) : (
                  <embed
                    src={pdfSrc}
                    type="application/pdf"
                    className="h-80 w-full rounded-inline"
                  />
                )}
              </div>
            </>
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

          {mode === "decode" && pdfSrc && (
            <Actions>
              <Button variant="primary" size="md" icon={DownloadSimpleIcon} onClick={handleDownload}>
                Download
              </Button>
            </Actions>
          )}
        </Card>

        <AboutCard title="About Base64 PDF">
          <p>
            Base64 encoding converts binary PDF data into a text string
            that can be embedded in HTML, JSON, or transmitted over
            text-based protocols.
          </p>
          <p>
            Encoding: upload a PDF to convert it into a{" "}
            <code>data:application/pdf;base64,...</code>{" "}
            string ready to use.
          </p>
          <p>
            Decoding: paste a Base64 PDF string to preview and download
            the reconstructed file. Works with both raw Base64 and full
            data URI strings.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
