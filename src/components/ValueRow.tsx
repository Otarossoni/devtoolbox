import type { ReactNode } from "react";

interface ValueRowProps {
  label: ReactNode;
  value: ReactNode;
  /** Trailing control, usually <CopyButton variant="icon" /> */
  action?: ReactNode;
  /** Truncate long values instead of wrapping */
  truncate?: boolean;
  valueClassName?: string;
}

/** Label on the left, mono value on the right — elevated fill */
export function ValueRow({ label, value, action, truncate = false, valueClassName = "" }: ValueRowProps) {
  return (
    <div className="flex min-h-control items-center justify-between gap-3 rounded-control bg-surface-elevated py-1 pr-1.5 pl-3.5">
      <span className="shrink-0 text-[13px] font-medium text-fg-secondary">{label}</span>
      <div className={`flex min-w-0 items-center gap-1 ${action ? "" : "pr-2"}`}>
        <code
          className={`min-w-0 text-right font-mono text-sm ${
            truncate ? "max-w-full truncate" : "break-all"
          } ${valueClassName.includes("text-") ? valueClassName : `text-fg ${valueClassName}`}`}
        >
          {value}
        </code>
        {action}
      </div>
    </div>
  );
}

interface ValueTileProps {
  label: ReactNode;
  value: ReactNode;
  action?: ReactNode;
  /** Value size: "sm" 14px, "lg" 18px, "stat" 24px accent */
  size?: "sm" | "lg" | "stat";
  align?: "start" | "center";
  valueClassName?: string;
}

/** Label above a value — swatch details, stats, multi-base outputs */
export function ValueTile({
  label,
  value,
  action,
  size = "sm",
  align = "start",
  valueClassName = "",
}: ValueTileProps) {
  const center = align === "center";
  const valueSize =
    size === "stat"
      ? "text-2xl font-semibold leading-none text-accent"
      : size === "lg"
        ? "text-lg text-fg"
        : "text-sm text-fg";
  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-control bg-surface-elevated ${
        action ? "pt-1.5 pr-1.5 pb-3 pl-3.5" : "px-3.5 py-3"
      } ${center ? "items-center text-center" : ""}`}
    >
      <div className={`flex min-h-5 items-center gap-2 ${center ? "justify-center" : "justify-between"}`}>
        <span className="text-xs font-medium text-fg-secondary">{label}</span>
        {action}
      </div>
      <code className={`block font-mono break-all ${valueSize} ${valueClassName}`}>{value}</code>
    </div>
  );
}

interface BadgeProps {
  tone?: "success" | "error" | "warning" | "accent" | "neutral";
  mono?: boolean;
  children: ReactNode;
}

const badgeTones = {
  success: "bg-success-tint text-success",
  error: "bg-error-tint text-error",
  warning: "bg-warning-tint text-warning",
  accent: "bg-accent-tint text-accent-text",
  neutral: "bg-surface-elevated text-fg-secondary",
};

/** Small status pill */
export function Badge({ tone = "neutral", mono = false, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-segment px-2.5 text-xs font-medium ${
        mono ? "font-mono" : ""
      } ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}
