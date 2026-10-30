import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import {
  FingerprintSimpleIcon,
  ArrowsLeftRightIcon,
  TextAaIcon,
  ClockIcon,
  BracketsCurlyIcon,
  ShieldCheckIcon,
  PaletteIcon,
  LinkSimpleIcon,
  MarkdownLogoIcon,
  ImageSquareIcon,
  HashStraightIcon,
  QrCodeIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";

const tools = [
  {
    title: "Base64",
    description: "Encode and decode text, files, and more in Base64 format",
    icon: ArrowsLeftRightIcon,
    href: "/tools/base64",
  },
  {
    title: "Color",
    description: "Convert colors between formats and generate harmonious palettes",
    icon: PaletteIcon,
    href: "/tools/color/converter",
  },
  {
    title: "Image",
    description: "Convert and resize images in your browser",
    icon: ImageSquareIcon,
    href: "/tools/image/converter",
  },
  {
    title: "JSON",
    description: "Format, validate, convert, diff, and explore JSON data and related formats",
    icon: BracketsCurlyIcon,
    href: "/tools/json/formatter",
  },
  {
    title: "Markdown",
    description: "Write and preview Markdown with live rendering and table generator",
    icon: MarkdownLogoIcon,
    href: "/tools/markdown/editor",
  },
  {
    title: "Number",
    description: "Base conversion, bitwise operations, and ASCII reference",
    icon: HashStraightIcon,
    href: "/tools/number/base",
  },
  {
    title: "QR Code",
    description: "Generate QR codes from any text or URL, live in your browser",
    icon: QrCodeIcon,
    href: "/tools/qrcode/generator",
  },
  {
    title: "Security",
    description: "Hash generator, password generator, and JWT decoder",
    icon: ShieldCheckIcon,
    href: "/tools/security/hash",
  },
  {
    title: "Text",
    description: "Case conversion, character counting, HTML entities, text diffing, and more",
    icon: TextAaIcon,
    href: "/tools/text/case",
  },
  {
    title: "Time",
    description: "Timestamp converter, date calculator, and cron expression parser",
    icon: ClockIcon,
    href: "/tools/time/timestamp",
  },
  {
    title: "URL",
    description: "Encode, decode, and parse URLs",
    icon: LinkSimpleIcon,
    href: "/tools/url/encoder",
  },
  {
    title: "UUID",
    description: "Universal unique identifier generator and validator",
    icon: FingerprintSimpleIcon,
    href: "/tools/uuid/generator",
  },
];

export default function Home() {
  return (
    <ToolPage>
      {/* Header */}
      <div className="mb-12 flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.15] font-bold tracking-[-0.025em] text-fg">DevToolbox</h1>
        <p className="text-base text-fg-secondary">
          Software development utilities.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group pressable flex items-start gap-3.5 rounded-card bg-surface p-5 text-fg transition hover:bg-surface-elevated"
          >
            <div className="flex size-11 flex-none items-center justify-center rounded-control bg-accent-tint text-accent">
              <tool.icon className="size-[22px]" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
              <p className="text-[15px] font-semibold tracking-[-0.01em]">
                {tool.title}
              </p>
              <p className="text-[13px] leading-[1.45] text-pretty text-fg-secondary">
                {tool.description}
              </p>
            </div>
            <ArrowRightIcon className="mt-1 size-4 flex-none text-fg-subtle transition group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </ToolPage>
  );
}
