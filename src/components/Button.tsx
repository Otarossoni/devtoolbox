import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";

type IconType = ComponentType<{ className?: string }>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: accent fill · secondary: elevated fill · ghost: no fill */
  variant?: "primary" | "secondary" | "ghost";
  /** md: 44px · sm: 36px with a 44px hit area */
  size?: "md" | "sm";
  icon?: IconType;
  children?: ReactNode;
}

const variants = {
  primary: "bg-accent font-semibold text-on-accent hover:bg-accent-hover",
  secondary: "bg-surface-elevated font-medium text-fg-secondary hover:text-fg",
  ghost: "bg-transparent font-medium text-fg-secondary hover:bg-surface-elevated hover:text-fg",
};

export default function Button({
  variant = "secondary",
  size = "sm",
  icon: Icon,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`pressable inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-40 ${
        variants[variant]
      } ${
        size === "md"
          ? "h-control gap-2 rounded-control px-[18px] text-sm"
          : `hit-area h-control-sm gap-1.5 rounded-segment px-3.5 ${variant === "primary" ? "text-sm" : "text-[13px]"}`
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === "md" ? "size-4" : "size-3.5"} />}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconType;
  /** Accessible name — required for icon-only buttons */
  label: string;
  /** md: 44px · sm: 36px with a 44px hit area */
  size?: "md" | "sm";
  variant?: "ghost" | "elevated";
}

export function IconButton({
  icon: Icon,
  label,
  size = "md",
  variant = "ghost",
  type = "button",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`pressable inline-flex shrink-0 cursor-pointer items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "elevated"
          ? "bg-surface-elevated text-fg"
          : "bg-transparent text-fg-secondary hover:bg-surface-elevated hover:text-fg"
      } ${size === "md" ? "size-control rounded-control" : "hit-area size-control-sm rounded-segment"} ${className}`}
      {...props}
    >
      <Icon className={size === "md" ? "size-5" : "size-4"} />
    </button>
  );
}

interface ToggleChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  /** Square 36×36 chip for single-character flags */
  square?: boolean;
  mono?: boolean;
  icon?: IconType;
  children?: ReactNode;
}

/** On/off option — same look as an active segment when pressed */
export function ToggleChip({
  pressed,
  square = false,
  mono = false,
  icon: Icon,
  type = "button",
  className = "",
  children,
  ...props
}: ToggleChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={`hit-area pressable inline-flex h-control-sm shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-segment font-medium transition ${
        square ? "w-control-sm" : "px-3.5"
      } ${mono ? "font-mono text-[13px]" : "text-sm"} ${
        pressed ? "bg-surface-elevated text-accent-text" : "bg-field text-fg-secondary hover:text-fg"
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
    </button>
  );
}
