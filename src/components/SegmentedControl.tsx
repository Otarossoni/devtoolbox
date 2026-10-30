import type { ComponentType, ReactNode } from "react";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  /** Secondary line under the label */
  hint?: ReactNode;
  /** Tooltip and accessible name, required for icon-only segments */
  title?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** "inline" hugs its content, "grid" stretches segments across the track */
  layout?: "inline" | "grid";
  /** Column classes for the grid layout, e.g. "grid-cols-2 sm:grid-cols-4" */
  gridClassName?: string;
  mono?: boolean;
  className?: string;
}

/** Track: field fill, r14, p4 · active segment: elevated fill + accent text · 36px items, 44px hit area */
export default function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  layout = "inline",
  gridClassName,
  mono = false,
  className = "",
}: SegmentedControlProps<T>) {
  const isGrid = layout === "grid";
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`${
        isGrid ? `grid ${gridClassName ?? ""}` : "inline-flex max-w-full flex-wrap self-start"
      } gap-1 rounded-tile bg-field p-1 ${className}`}
      style={isGrid && !gridClassName ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}
    >
      {options.map((opt) => (
        <SegmentButton
          key={String(opt.value)}
          option={opt}
          active={opt.value === value}
          onClick={() => onChange(opt.value)}
          mono={mono}
        />
      ))}
    </div>
  );
}

function SegmentButton<T extends string | number>({
  option,
  active,
  onClick,
  mono,
}: {
  option: SegmentedOption<T>;
  active: boolean;
  onClick: () => void;
  mono: boolean;
}) {
  const Icon = option.icon;
  const iconOnly = Icon && !option.label;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={iconOnly ? option.title : undefined}
      title={option.title}
      onClick={onClick}
      className={`hit-area pressable inline-flex cursor-pointer items-center justify-center rounded-segment font-medium transition ${
        option.hint ? "min-h-control-sm flex-col gap-0.5 px-3.5 py-2" : "h-control-sm gap-1.5"
      } ${iconOnly ? "w-control-sm" : "px-3.5"} ${mono ? "font-mono text-[13px]" : "text-sm"} ${
        active ? "bg-surface-elevated text-accent-text" : "text-fg-secondary hover:text-fg"
      }`}
    >
      {Icon && <Icon className={iconOnly ? "size-4" : "size-[15px]"} />}
      {option.label}
      {option.hint && (
        <span className={`font-sans text-xs font-normal ${active ? "text-fg-secondary" : "text-fg-tertiary"}`}>
          {option.hint}
        </span>
      )}
    </button>
  );
}
