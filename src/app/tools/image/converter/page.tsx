"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ImageSquareIcon,
  DownloadSimpleIcon,
  ImageIcon,
} from "@phosphor-icons/react/dist/ssr";
import { jsPDF } from "jspdf";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import DropZone from "@/components/DropZone";
import { Actions } from "@/components/Output";

type Format = "png" | "jpeg" | "webp" | "pdf";

const FORMATS: { value: Format; label: string; mime: string }[] = [
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { value: "webp", label: "WebP", mime: "image/webp" },
  { value: "pdf", label: "PDF", mime: "application/pdf" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageConverterPage() {
  const [image, setImage] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState("");
  const [format, setFormat] = useState<Format>("jpeg");
  const [quality, setQuality] = useState(0.85);
  const [convertedSrc, setConvertedSrc] = useState("");
  const [convertedSize, setConvertedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const convert = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setOriginalSrc(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        if (format === "pdf") {
          const pxToMm = (px: number) => px * 0.264583;
          const pdf = new jsPDF({
            orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait",
            unit: "mm",
            format: [pxToMm(img.naturalWidth), pxToMm(img.naturalHeight)],
          });
          const jpegData = canvas.toDataURL("image/jpeg", quality);
          pdf.addImage(jpegData, "JPEG", 0, 0, pxToMm(img.naturalWidth), pxToMm(img.naturalHeight));
          const blob = pdf.output("blob");
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setConvertedSrc(url);
          setConvertedSize(blob.size);
        } else {
          const mime = FORMATS.find((f) => f.value === format)!.mime;
          const q = format === "png" ? undefined : quality;
          canvas.toBlob(
            (blob) => {
              if (!blob) return;
              if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
              const url = URL.createObjectURL(blob);
              blobUrlRef.current = url;
              setConvertedSrc(url);
              setConvertedSize(blob.size);
            },
            mime,
            q,
          );
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [format, quality]);

  const processFile = useCallback((file: File) => {
    setImage(file);
    convert(file);
  }, [convert]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith("image/")) processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) processFile(file);
    },
    [processFile],
  );

  const handleReconvert = useCallback(() => {
    if (image) convert(image);
  }, [image, convert]);

  const handleDownload = useCallback(() => {
    if (!convertedSrc) return;
    const a = document.createElement("a");
    a.href = convertedSrc;
    const ext = format === "jpeg" ? "jpg" : format;
    a.download = `image.${ext}`;
    a.click();
  }, [convertedSrc, format]);

  const hasQuality = format !== "png";

  return (
    <ToolPage>
      <ToolHeader
        icon={ImageSquareIcon}
        title="Image Converter"
        description="Convert images between PNG, JPEG, WebP, and PDF"
      />

      <CardStack>
        <Card label="Upload">
          <DropZone
            isDragging={isDragging}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            icon={ImageIcon}
            loaded={!!image}
            title={image ? image.name : "Drop an image or click to browse"}
            meta={image ? `${formatSize(image.size)} · Click or drop to change` : undefined}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <canvas ref={canvasRef} className="hidden" />
        </Card>

        {image && (
          <>
            <Card
              label="Options"
              actions={
                <Button variant="primary" onClick={handleReconvert}>
                  Convert
                </Button>
              }
            >
              <SegmentedControl
                ariaLabel="Output format"
                layout="grid"
                value={format}
                onChange={setFormat}
                options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
              />

              {hasQuality && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="image-quality">Quality</FieldLabel>
                    <span className="font-mono text-[13px] text-fg">{quality.toFixed(2)}</span>
                  </div>
                  <input
                    id="image-quality"
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="h-control w-full cursor-pointer"
                  />
                </div>
              )}
            </Card>

            {convertedSrc && (
              <Card label="Preview">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-fg-secondary">
                      Original · {formatSize(image.size)}
                    </span>
                    <div className="flex h-60 items-center justify-center rounded-control bg-field p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={originalSrc}
                        alt="Original"
                        className="max-h-full max-w-full rounded-inline object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-fg-secondary">
                      {FORMATS.find((f) => f.value === format)!.label} · {formatSize(convertedSize)}
                    </span>
                    <div className="flex h-60 items-center justify-center rounded-control bg-field p-2">
                      {format === "pdf" ? (
                        <embed
                          src={convertedSrc}
                          type="application/pdf"
                          className="h-full w-full rounded-inline object-contain"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={convertedSrc}
                          alt="Converted"
                          className="max-h-full max-w-full rounded-inline object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <Actions>
                  <Button variant="primary" size="md" icon={DownloadSimpleIcon} onClick={handleDownload}>
                    Download
                  </Button>
                </Actions>
              </Card>
            )}
          </>
        )}

        <AboutCard title="About Image Converter">
          <p>
            Convert images between PNG, JPEG, WebP, and PDF formats entirely in
            your browser. Nothing is uploaded — all processing happens
            locally via the Canvas API and jsPDF.
          </p>
          <p>
            <strong>PNG</strong> — lossless, supports transparency.{" "}
            <strong>JPEG</strong> — lossy, smaller files, no transparency.{" "}
            <strong>WebP</strong> — modern format, smaller than both with
            quality comparable to JPEG.{" "}
            <strong>PDF</strong> — embeds the image in a PDF document.
          </p>
          <p>
            Adjust quality (0.1–1.0) for JPEG, WebP, and PDF. PNG ignores quality
            since it&rsquo;s always lossless. Click <strong>Convert</strong>{" "}
            to re-process after changing options.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
