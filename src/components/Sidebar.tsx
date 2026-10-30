"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import pkg from "../../package.json";
import AppIcon from "@/components/AppIcon";
import {
  ListIcon,
  XIcon,
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
  CaretRightIcon,
  HouseIcon,
} from "@phosphor-icons/react/dist/ssr";

interface TreeItem {
  label: string;
  href: string;
}

interface TreeCategory {
  label: string;
  icon: typeof HouseIcon;
  items: TreeItem[];
}

const menuTree: TreeCategory[] = [
  {
    label: "Base64",
    icon: ArrowsLeftRightIcon,
    items: [
      { label: "Text", href: "/tools/base64" },
      { label: "Image", href: "/tools/base64/image" },
      { label: "PDF", href: "/tools/base64/pdf" },
      { label: "File", href: "/tools/base64/file" },
      { label: "Validator", href: "/tools/base64/validator" },
    ],
  },
  {
    label: "Color",
    icon: PaletteIcon,
    items: [
      { label: "Converter", href: "/tools/color/converter" },
      { label: "Palette", href: "/tools/color/palette" },
      { label: "Contrast", href: "/tools/color/contrast" },
    ],
  },
  {
    label: "Image",
    icon: ImageSquareIcon,
    items: [
      { label: "Converter", href: "/tools/image/converter" },
      { label: "Resizer", href: "/tools/image/resizer" },
      { label: "Extractor", href: "/tools/image/extractor" },
    ],
  },
  {
    label: "JSON",
    icon: BracketsCurlyIcon,
    items: [
      { label: "Formatter & Validator", href: "/tools/json/formatter" },
      { label: "CSV Converter", href: "/tools/json/converter" },
      { label: "YAML Converter", href: "/tools/json/yaml" },
      { label: "XML Converter", href: "/tools/json/xml" },
      { label: "Query String", href: "/tools/json/querystring" },
      { label: "Diff", href: "/tools/json/diff" },
      { label: "Path", href: "/tools/json/path" },
    ],
  },
  {
    label: "Markdown",
    icon: MarkdownLogoIcon,
    items: [
      { label: "Editor", href: "/tools/markdown/editor" },
      { label: "Table", href: "/tools/markdown/table" },
    ],
  },
  {
    label: "Number",
    icon: HashStraightIcon,
    items: [
      { label: "Base Converter", href: "/tools/number/base" },
      { label: "Bitwise Calculator", href: "/tools/number/bitwise" },
      { label: "ASCII Table", href: "/tools/number/ascii" },
    ],
  },
  {
    label: "QR Code",
    icon: QrCodeIcon,
    items: [
      { label: "Generator", href: "/tools/qrcode/generator" },
    ],
  },
  {
    label: "Security",
    icon: ShieldCheckIcon,
    items: [
      { label: "Hash Generator", href: "/tools/security/hash" },
      { label: "Password", href: "/tools/security/password" },
      { label: "JWT Decoder", href: "/tools/security/jwt" },
    ],
  },
  {
    label: "Text",
    icon: TextAaIcon,
    items: [
      { label: "Case Switcher", href: "/tools/text/case" },
      { label: "Char Counter", href: "/tools/text/counter" },
      { label: "Diff Checker", href: "/tools/text/diff" },
      { label: "HTML Entities", href: "/tools/text/htmlentities" },
      { label: "Lorem Ipsum", href: "/tools/text/lorem" },
      { label: "Replacer", href: "/tools/text/replacer" },
      { label: "Text to Slug", href: "/tools/text/slug" },
    ],
  },
  {
    label: "Time",
    icon: ClockIcon,
    items: [
      { label: "Timestamp", href: "/tools/time/timestamp" },
      { label: "Calculator", href: "/tools/time/calculator" },
      { label: "Cron Parser", href: "/tools/time/cron" },
    ],
  },
  {
    label: "URL",
    icon: LinkSimpleIcon,
    items: [
      { label: "Encoder/Decoder", href: "/tools/url/encoder" },
      { label: "Parser", href: "/tools/url/parser" },
    ],
  },
  {
    label: "UUID",
    icon: FingerprintSimpleIcon,
    items: [
      { label: "Generator", href: "/tools/uuid/generator" },
      { label: "Bulk Generator", href: "/tools/uuid/bulk" },
      { label: "Validator", href: "/tools/uuid/validator" },
      { label: "Inspector", href: "/tools/uuid/inspector" },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const cat of menuTree) {
        initial[cat.label] = cat.items.some(
          (item) => pathname === item.href || pathname.startsWith(item.href + "/")
        );
      }
      return initial;
    }
  );

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo — the mobile drawer reserves room for the close button */}
      <div className={`pt-8 pb-5 pl-6 ${onNavigate ? "pr-14" : "pr-3"}`}>
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 rounded-control"
        >
          <AppIcon size={36} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-lg leading-tight font-bold tracking-[-0.025em] text-fg transition-colors group-hover:text-accent">
              DevToolbox
            </span>
            <span className="text-[13px] text-fg-secondary">Software development utilities.</span>
          </span>
        </Link>
      </div>

      {/* Home link */}
      <div className="px-3">
        <Link
          href="/"
          onClick={onNavigate}
          aria-current={pathname === "/" ? "page" : undefined}
          className={`flex min-h-control items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-surface-elevated text-accent-text"
              : "text-fg-secondary hover:bg-surface-hover hover:text-fg"
          }`}
        >
          <HouseIcon className="size-[18px]" />
          Home
        </Link>
      </div>

      {/* Tree menu */}
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {menuTree.map((category) => {
          const isOpen = openCategories[category.label];
          const hasActiveChild = category.items.some(
            (item) => pathname === item.href
          );

          return (
            <div key={category.label} className="flex flex-col">
              <button
                onClick={() => toggleCategory(category.label)}
                aria-expanded={!!isOpen}
                className={`pressable flex min-h-control w-full cursor-pointer items-center gap-3 rounded-control px-3 text-left text-sm font-medium transition hover:bg-surface-hover hover:text-fg ${
                  hasActiveChild ? "text-fg" : "text-fg-secondary"
                }`}
              >
                <category.icon className="size-[18px] shrink-0" />
                <span className="flex-1">{category.label}</span>
                <CaretRightIcon
                  className={`size-3.5 text-fg-subtle transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
              </button>

              <div
                className={`flex flex-col gap-0.5 overflow-hidden transition-[max-height,opacity,padding] ${
                  isOpen ? "pt-0.5 opacity-100" : "opacity-0"
                }`}
                style={{ maxHeight: isOpen ? category.items.length * 46 + 8 : 0 }}
              >
                {category.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      tabIndex={isOpen ? undefined : -1}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-control items-center rounded-control pr-3 pl-[42px] text-sm transition-colors ${
                        isActive
                          ? "bg-surface-elevated font-semibold text-accent-text"
                          : "font-medium text-fg-secondary hover:text-fg"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 pt-4 pb-6">
        <p className="text-xs leading-normal text-fg-tertiary">
          v{pkg.version} · by{" "}
          <a
            href="https://otaviorossoni.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-inline transition-colors hover:text-accent"
          >
            Otávio Monteiro Rossoni
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="pressable fixed top-4 left-4 z-50 flex size-control cursor-pointer items-center justify-center rounded-control bg-surface-elevated text-fg transition lg:hidden"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        <ListIcon className="size-5" />
      </button>

      {/* Mobile scrim */}
      <div
        className={`fixed inset-0 z-40 bg-background/60 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-sidebar bg-surface transition-[transform,visibility] lg:hidden ${
          isOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="pressable absolute top-5 right-3 flex size-control cursor-pointer items-center justify-center rounded-control text-fg-secondary transition hover:bg-surface-elevated hover:text-fg"
          aria-label="Fechar menu"
        >
          <XIcon className="size-5" />
        </button>
        <SidebarContent onNavigate={() => setIsOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-sidebar shrink-0 bg-surface lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
