"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { QrCodeIcon, DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import QRCode from "qrcode";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";

type ErrorLevel = "L" | "M" | "Q" | "H";

const EC_LEVELS: { value: ErrorLevel; label: string; desc: string }[] = [
  { value: "L", label: "L", desc: "~7% recovery" },
  { value: "M", label: "M", desc: "~15% recovery" },
  { value: "Q", label: "Q", desc: "~25% recovery" },
  { value: "H", label: "H", desc: "~30% recovery" },
];

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [ecLevel, setEcLevel] = useState<ErrorLevel>("M");
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(2);
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!text.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      QRCode.toDataURL(text.trim(), {
        errorCorrectionLevel: ecLevel,
        width: size,
        margin,
        color: {
          dark: `${dark}ff`,
          light: `${light}ff`,
        },
      })
        .then((url) => setDataUrl(url))
        .catch(() => setDataUrl(""));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, ecLevel, size, margin, dark, light]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }, [dataUrl]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 3000) {
      setText(value);
      if (!value.trim()) setDataUrl("");
    }
  }, []);

  return (
    <ToolPage>
      <ToolHeader
        icon={QrCodeIcon}
        title="QR Code Generator"
        description="Generate QR codes from any text or URL, live in your browser"
      />

      <CardStack>
        <Card
          label="Input"
          actions={
            text.length > 2500 ? (
              <span className="font-mono text-xs text-warning">
                {text.length} / 3000
              </span>
            ) : undefined
          }
        >
          <TextArea
            value={text}
            onChange={handleTextChange}
            placeholder={"Enter text or URL to encode...\ne.g. https://example.com"}
            rows={3}
          />

          <div className="flex flex-col gap-2">
            <FieldLabel>Error correction</FieldLabel>
            <SegmentedControl
              ariaLabel="Error correction"
              layout="grid"
              value={ecLevel}
              onChange={setEcLevel}
              options={EC_LEVELS.map((ec) => ({
                value: ec.value,
                label: ec.label,
                hint: ec.desc,
                title: ec.desc,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="qr-size">Size</FieldLabel>
                <span className="font-mono text-[13px] text-fg">{size}px</span>
              </div>
              <input
                id="qr-size"
                type="range"
                min={128}
                max={1024}
                step={8}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="h-control w-full cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="qr-margin">Margin</FieldLabel>
                <span className="font-mono text-[13px] text-fg">{margin}</span>
              </div>
              <input
                id="qr-margin"
                type="range"
                min={0}
                max={10}
                step={1}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="h-control w-full cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-control cursor-pointer items-center gap-2.5 rounded-control bg-field py-1 pr-1 pl-3.5">
              <span className="text-[13px] font-medium text-fg-secondary">Dark</span>
              <input
                type="color"
                value={dark}
                onChange={(e) => setDark(e.target.value)}
                className="size-control-sm cursor-pointer rounded-segment bg-transparent p-0"
              />
            </label>
            <label className="flex min-h-control cursor-pointer items-center gap-2.5 rounded-control bg-field py-1 pr-1 pl-3.5">
              <span className="text-[13px] font-medium text-fg-secondary">Light</span>
              <input
                type="color"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                className="size-control-sm cursor-pointer rounded-segment bg-transparent p-0"
              />
            </label>
          </div>
        </Card>

        {dataUrl && (
          <Card label="Preview">
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex max-w-full overflow-auto rounded-tile bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl}
                  alt="QR Code"
                  className="block"
                  style={{ width: size, height: size }}
                />
              </div>
              <Button variant="primary" size="md" icon={DownloadSimpleIcon} onClick={handleDownload}>
                Download PNG
              </Button>
            </div>
          </Card>
        )}

        <AboutCard title="About QR Code Generator">
          <p>
            Generate QR codes entirely in your browser — no data is sent
            anywhere. Enter any text or URL and get a live-updating QR code
            image.
          </p>
          <p>
            <strong>Error correction</strong> controls how much of the QR
            code can be damaged or obscured while still being readable:
            L (~7%), M (~15%), Q (~25%), H (~30%). Higher levels add more
            redundancy at the cost of larger QR codes.
          </p>
          <p>
            Adjust <strong>size</strong> (128–1024px), <strong>margin</strong>{" "}
            (quiet zone width), and <strong>colors</strong> for custom
            styling. Download as PNG with a single click.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
