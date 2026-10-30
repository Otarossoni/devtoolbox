"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ResizeIcon,
  DownloadSimpleIcon,
  ImageIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button, { ToggleChip } from "@/components/Button";
import DropZone from "@/components/DropZone";
import { Actions } from "@/components/Output";

type Format = "png" | "jpeg" | "webp";

const FORMATS: { value: Format; label: string; mime: string }[] = [
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { value: "webp", label: "WebP", mime: "image/webp" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageResizerPage() {
  const [image, setImage] = useState<File | null>(null);
  const [originalW, setOriginalW] = useState(0);
  const [originalH, setOriginalH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<Format>("jpeg");
  const [previewSrc, setPreviewSrc] = useState("");
  const [resizedSize, setResizedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const resize = useCallback(
    (w: number, h: number, file: File) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const mime = FORMATS.find((f) => f.value === format)!.mime;
        canvas.toBlob((blob) => {
          if (!blob) return;
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setPreviewSrc(url);
          setResizedSize(blob.size);
        }, mime);
      };
      img.src = URL.createObjectURL(file);
    },
    [format],
  );

  const processFile = useCallback((file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOriginalW(img.naturalWidth);
        setOriginalH(img.naturalHeight);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        resize(img.naturalWidth, img.naturalHeight, file);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, [resize]);

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

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const w = parseInt(e.target.value) || 0;
      setWidth(w);
      if (lockAspect && originalW > 0) {
        const h = Math.round((w / originalW) * originalH);
        setHeight(h);
        if (w > 0 && h > 0) resize(w, h, image!);
      } else if (w > 0 && height > 0) {
        resize(w, height, image!);
      }
    },
    [lockAspect, originalW, originalH, height, resize, image],
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = parseInt(e.target.value) || 0;
      setHeight(h);
      if (lockAspect && originalH > 0) {
        const w = Math.round((h / originalH) * originalW);
        setWidth(w);
        if (w > 0 && h > 0) resize(w, h, image!);
      } else if (width > 0 && h > 0) {
        resize(width, h, image!);
      }
    },
    [lockAspect, originalW, originalH, width, resize, image],
  );

  const handleResize = useCallback(() => {
    if (width > 0 && height > 0) resize(width, height, image!);
  }, [width, height, resize, image]);

  const handleDownload = useCallback(() => {
    if (!previewSrc) return;
    const a = document.createElement("a");
    a.href = previewSrc;
    const ext = format === "jpeg" ? "jpg" : format;
    a.download = `resized.${ext}`;
    a.click();
  }, [previewSrc, format]);

  return (
    <ToolPage>
      <ToolHeader
        icon={ResizeIcon}
        title="Image Resizer"
        description="Resize images with aspect ratio lock"
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
            meta={
              image
                ? `${originalW}×${originalH} · ${formatSize(image.size)} · Click or drop to change`
                : undefined
            }
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
              label="Dimensions"
              actions={
                <ToggleChip
                  pressed={lockAspect}
                  onClick={() => setLockAspect(!lockAspect)}
                  icon={lockAspect ? LockKeyIcon : LockKeyOpenIcon}
                >
                  {lockAspect ? "Locked" : "Unlocked"}
                </ToggleChip>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="resize-width">Width</FieldLabel>
                  <TextField
                    id="resize-width"
                    type="number"
                    value={width || ""}
                    onChange={handleWidthChange}
                    placeholder="Width"
                    min={1}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="resize-height">Height</FieldLabel>
                  <TextField
                    id="resize-height"
                    type="number"
                    value={height || ""}
                    onChange={handleHeightChange}
                    placeholder="Height"
                    min={1}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SegmentedControl
                  ariaLabel="Output format"
                  layout="grid"
                  className="flex-1"
                  value={format}
                  onChange={setFormat}
                  options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
                />
                <Button variant="primary" size="md" onClick={handleResize}>
                  Resize
                </Button>
              </div>

              <p className="text-xs text-fg-tertiary">
                Original: {originalW}×{originalH} · {formatSize(image.size)}
                {width > 0 && height > 0 && (width !== originalW || height !== originalH) && (
                  <span> → {width}×{height}</span>
                )}
              </p>
            </Card>

            {previewSrc && (
              <Card label={`Preview · ${formatSize(resizedSize)}`}>
                <div className="flex items-center justify-center rounded-control bg-field p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-h-80 max-w-full rounded-inline object-contain"
                  />
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

        <AboutCard title="About Image Resizer">
          <p>
            Resize any image by setting exact width and height. Toggle the
            aspect ratio lock to maintain proportions or set dimensions
            independently. All processing happens locally via the Canvas API.
          </p>
          <p>
            <strong>Locked</strong> — changing one dimension updates the
            other to preserve the original aspect ratio.{" "}
            <strong>Unlocked</strong> — set both dimensions freely. Output
            format can be PNG, JPEG, or WebP.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
