import Link from "next/link";
import {
  FingerprintSimpleIcon,
  ArrowsLeftRightIcon,
  TextAaIcon,
  ClockIcon,
  BracketsCurlyIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";

const tools = [
  {
    title: "UUID",
    description: "Universal unique identifier generator and validator",
    icon: FingerprintSimpleIcon,
    href: "/tools/uuid/generator",
  },
  {
    title: "Base64",
    description: "Encode and decode text, files, and more in Base64 format",
    icon: ArrowsLeftRightIcon,
    href: "/tools/base64",
  },
  {
    title: "Text",
    description: "Case conversion, character counting, text diffing, and more",
    icon: TextAaIcon,
    href: "/tools/text/case",
  },
  {
    title: "Time",
    description: "Timestamp converter and date calculator",
    icon: ClockIcon,
    href: "/tools/time/timestamp",
  },
  {
    title: "JSON",
    description: "Format, validate, minify, and convert JSON data",
    icon: BracketsCurlyIcon,
    href: "/tools/json/formatter",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="animate-5 mb-12">
          <h1 className="text-2xl font-bold mb-2">DevToolbox</h1>
          <p className="text-neutral-500 text-base">
            Software development utilities.
          </p>
        </div>

        {/* Tools grid */}
        <div className="animate-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative block rounded-lg border p-5 transition-all duration-200 border-[#262626] bg-[#0a0a0a] hover:bg-[#171717] hover:border-[#8A2BE2] cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center shrink-0 w-9 h-9 rounded-lg border bg-[#8A2BE2]/10 border-[#8A2BE2]/20">
                    <tool.icon className="h-5 w-5 text-[#8A2BE2]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#ededed]">
                      {tool.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-neutral-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-[#8A2BE2] group-hover:translate-x-1 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
