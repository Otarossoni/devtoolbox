"use client";

import { useState, useCallback, useRef } from "react";
import {
  LockKeyIcon,
  LockKeyOpenIcon,
  DownloadSimpleIcon,
  ImageIcon,
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

export default function Base64ImagePage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Each mode keeps its own state so switching modes preserves input
  const [fileName, setFileName] = useState("");
  const [encodedBase64, setEncodedBase64] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodedSrc, setDecodedSrc] = useState("");
  const [decodeError, setDecodeError] = useState(false);

  const base64 = mode === "encode" ? encodedBase64 : decodeInput;
  const imageSrc = mode === "encode" ? encodedBase64 : decodedSrc;
  const error = mode === "decode" && decodeError;

  // ---- Encode: file upload ----

  const processFile = useCallback((file: File) => {
    setFileName(file.name);

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
      if (file?.type.startsWith("image/")) {
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

      const trimmed = value.trim();
      if (!trimmed) {
        setDecodedSrc("");
        setDecodeError(false);
        return;
      }

      const src = trimmed.startsWith("data:image/")
        ? trimmed
        : `data:image/png;base64,${trimmed}`;

      const img = new Image();
      img.onload = () => {
        setDecodedSrc(src);
        setDecodeError(false);
      };
      img.onerror = () => {
        setDecodedSrc("");
        setDecodeError(true);
      };
      img.src = src;
    },
    [],
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
    const mimeMatch = decodedSrc.match(/^data:(image\/\w+)/);
    const ext = mimeMatch ? mimeMatch[1].split("/")[1] : "png";
    a.download = `image.${ext}`;
    a.click();
  }, [decodedSrc]);

  return (
    <ToolPage>
      <ToolHeader
        icon={ImageIcon}
        title="Base64 Image"
        description="Encode images to Base64 and decode them back"
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
                icon={ImageIcon}
                loaded={!!fileName}
                title={fileName || "Drop an image here or click to browse"}
                meta={fileName ? "Click or drop to change" : undefined}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <TextArea
              value={base64}
              onChange={handleDecodeInput}
              placeholder="Paste a Base64 image string..."
              rows={3}
            />
          )}

          {(imageSrc || error) && (
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
                      ? "Invalid Base64 image string"
                      : "Failed to process image"}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="max-h-80 max-w-full rounded-inline object-contain"
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

          {mode === "decode" && imageSrc && (
            <Actions>
              <Button variant="primary" size="md" icon={DownloadSimpleIcon} onClick={handleDownload}>
                Download
              </Button>
            </Actions>
          )}
        </Card>

        <AboutCard title="About Base64 Images">
          <p>
            Base64 encoding converts binary image data into a text string
            that can be embedded directly in HTML, CSS, or JSON. It is
            commonly used for inline images in emails, data URIs, and
            API payloads.
          </p>
          <p>
            Encoding: upload an image to convert it into a <code>data:image/...;base64,...</code>{" "}
            string ready to use. The format is detected automatically from
            the file.
          </p>
          <p>
            Decoding: paste a Base64 image string to preview and download
            the reconstructed image. Works with both raw Base64 and full
            data URI strings.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
