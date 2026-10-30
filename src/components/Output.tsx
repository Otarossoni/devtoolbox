import type { ReactNode } from "react";

interface CodeBlockProps {
  /** Pre-rendered, already-escaped HTML (syntax highlighting, trees) */
  html?: string;
  children?: ReactNode;
  /** Tailwind max-height class, e.g. "max-h-96" */
  maxHeight?: string;
  tone?: "default" | "primary";
  className?: string;
}

/** Field fill, Geist Mono 13/1.7 — formatted code, JSON, trees */
export function CodeBlock({ html, children, maxHeight = "", tone = "default", className = "" }: CodeBlockProps) {
  const cls = `code-syntax m-0 overflow-auto rounded-control bg-field p-4 font-mono text-[13px] leading-[1.7] whitespace-pre-wrap break-all ${
    tone === "primary" ? "text-fg" : "text-fg-secondary"
  } ${maxHeight} ${className}`;
  if (html !== undefined) {
    return <pre className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <pre className={cls}>{children}</pre>;
}

interface OutputBoxProps {
  children: ReactNode;
  tone?: "default" | "error";
  className?: string;
}

/** Single-value result area (encoded string, UUID, password) */
export function OutputBox({ children, tone = "default", className = "" }: OutputBoxProps) {
  return (
    <div
      className={`flex min-h-14 items-center justify-between gap-4 rounded-control p-4 ${
        tone === "error" ? "bg-field-error" : "bg-field"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Large mono value inside an OutputBox */
export function OutputValue({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <code className={`font-mono text-base break-all whitespace-pre-wrap text-fg select-all sm:text-lg ${className}`}>
      {children}
    </code>
  );
}

/** Placeholder shown before there is a result */
export function OutputPlaceholder({ children }: { children: ReactNode }) {
  return <span className="text-sm text-fg-tertiary">{children}</span>;
}

/** Right-aligned row of output actions (copy, download, generate) */
export function Actions({ children, align = "end" }: { children: ReactNode; align?: "end" | "between" | "center" }) {
  const justify = align === "between" ? "justify-between" : align === "center" ? "justify-center" : "justify-end";
  return <div className={`flex flex-wrap items-center gap-2 ${justify}`}>{children}</div>;
}
