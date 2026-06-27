"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import pkg from "../../package.json";
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
  CaretDownIcon,
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
      { label: "Lorem Ipsum", href: "/tools/text/lorem" },
      { label: "Replacer", href: "/tools/text/replacer" },
    ],
  },
  {
    label: "Time",
    icon: ClockIcon,
    items: [
      { label: "Timestamp", href: "/tools/time/timestamp" },
      { label: "Calculator", href: "/tools/time/calculator" },
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-lg font-semibold text-[#ededed] hover:text-[#8A2BE2] transition-colors duration-200"
        >
          DevToolbox
        </Link>
        <p className="text-xs text-neutral-500 mt-1">Software development utilities.</p>
      </div>

      {/* Home link */}
      <div className="px-4 pb-4">
        <Link
          href="/"
          onClick={onNavigate}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
            pathname === "/"
              ? "bg-[#171717] text-[#8A2BE2]"
              : "text-neutral-400 hover:text-[#ededed] hover:bg-[#171717]"
          }`}
        >
          <HouseIcon className="h-4 w-4" />
          Home
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#262626]" />

      {/* Tree menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {menuTree.map((category) => {
          const isOpen = openCategories[category.label];
          const hasActiveChild = category.items.some(
            (item) => pathname === item.href
          );

          return (
            <div key={category.label}>
              <button
                onClick={() => toggleCategory(category.label)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 cursor-pointer ${
                  hasActiveChild
                    ? "text-[#ededed]"
                    : "text-neutral-400 hover:text-[#ededed] hover:bg-[#171717]"
                }`}
              >
                <category.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{category.label}</span>
                {isOpen ? (
                  <CaretDownIcon className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-200" />
                ) : (
                  <CaretRightIcon className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-200" />
                )}
              </button>

              <div
                className={`ml-4 space-y-0.5 border-l border-[#262626] pl-3 overflow-hidden transition-all duration-300 ease-out ${
                  isOpen ? "max-h-80 mt-0.5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {category.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`block px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${
                        isActive
                          ? "text-[#8A2BE2] bg-[#171717]"
                          : "text-neutral-500 hover:text-[#ededed] hover:bg-[#171717]"
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
      <div className="px-6 py-4 border-t border-[#262626]">
        <p className="text-[10px] text-neutral-600">
          v{pkg.version} · by{" "}
          <a
            href="https://otaviorossoni.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8A2BE2] transition-colors duration-200"
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

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#171717] border border-[#262626] text-neutral-400 hover:text-[#ededed] transition-colors duration-200 cursor-pointer"
        aria-label="Abrir menu"
      >
        <ListIcon className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#000000] border-r border-[#262626] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-neutral-500 hover:text-[#ededed] transition-colors duration-200 cursor-pointer"
          aria-label="Fechar menu"
        >
          <XIcon className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={() => setIsOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-[#000000] border-r border-[#262626] shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
