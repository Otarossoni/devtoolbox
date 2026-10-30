import type { ReactNode } from "react";

interface CardProps {
  /** Section label, 13/600, sentence case */
  label?: ReactNode;
  /** Controls aligned to the right of the label (copy, segmented, primary action) */
  actions?: ReactNode;
  tone?: "default" | "error";
  className?: string;
  children?: ReactNode;
}

export default function Card({ label, actions, tone = "default", className = "", children }: CardProps) {
  const isError = tone === "error";
  return (
    <section
      className={`flex flex-col rounded-card p-card-sm sm:p-card ${
        isError ? "gap-2 bg-error-tint" : "gap-4 bg-surface"
      } ${className}`}
    >
      {(label || actions) && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${
            actions ? "min-h-control" : "min-h-5"
          }`}
        >
          {label && (
            <span className={`text-[13px] font-semibold ${isError ? "text-error" : "text-fg-secondary"}`}>
              {label}
            </span>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Error card: red tint, no border, mono message */
export function ErrorCard({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <Card tone="error" label={label}>
      <p className="font-mono text-[13px] leading-[1.6] break-words text-error">{children}</p>
    </Card>
  );
}

/** Closes every tool page: title 15/700, body 14/1.6 secondary, bold terms in primary */
export function AboutCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-card bg-surface p-card-sm sm:p-card">
      <h2 className="text-[15px] font-bold tracking-[-0.015em] text-fg">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-[1.6] text-pretty text-fg-secondary [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-fg [&_strong]:font-semibold [&_strong]:text-fg">
        {children}
      </div>
    </section>
  );
}

/** Small label used above fields and sub-blocks inside a card */
export function FieldLabel({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = `block text-[13px] font-medium text-fg-secondary ${className}`;
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cls}>
      {children}
    </label>
  ) : (
    <span className={cls}>{children}</span>
  );
}

/** Secondary info shown next to a card label (counts, sizes, coordinates) */
export function CardMeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-xs text-fg-tertiary ${className}`}>{children}</span>;
}
