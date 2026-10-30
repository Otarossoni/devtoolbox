"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";

interface CopyButtonProps {
  /** Uncontrolled: text copied by the button itself */
  text?: string;
  /** Controlled: copied state owned by the page */
  copied?: boolean;
  /** Controlled: the page's own copy handler */
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
  copiedLabel?: string;
  /** button: 36px elevated · inline: text-only (e.g. "Copy HEX") · icon: 36px icon only */
  variant?: "button" | "inline" | "icon";
  className?: string;
}

export default function CopyButton({
  text,
  copied: copiedProp,
  onClick,
  disabled = false,
  label = "Copy",
  copiedLabel = "Copied!",
  variant = "button",
  className = "",
}: CopyButtonProps) {
  const [copiedSelf, setCopiedSelf] = useState(false);
  const copied = copiedProp ?? copiedSelf;

  const handleCopy = async () => {
    if (onClick) {
      onClick();
      return;
    }
    if (text === undefined) return;
    await navigator.clipboard.writeText(text);
    setCopiedSelf(true);
    setTimeout(() => setCopiedSelf(false), 2000);
  };

  const Icon = copied ? CheckIcon : CopyIcon;
  const base =
    "hit-area pressable inline-flex h-control-sm shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        disabled={disabled}
        aria-label={copied ? copiedLabel : label}
        title={copied ? copiedLabel : label}
        className={`${base} w-control-sm rounded-segment ${
          copied ? "text-success" : "text-fg-secondary hover:text-accent-text"
        } ${className}`}
      >
        <Icon className="size-3.5" />
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        disabled={disabled}
        className={`${base} -ml-2 self-start rounded-segment px-2 text-xs ${
          copied ? "text-success" : "text-fg-secondary hover:text-accent-text"
        } ${className}`}
      >
        <Icon className="size-3.5" />
        {copied ? copiedLabel : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`${base} rounded-segment px-3.5 text-[13px] ${
        copied ? "bg-success-tint text-success" : "bg-surface-elevated text-fg-secondary hover:text-fg"
      } ${className}`}
    >
      <Icon className="size-3.5" />
      {copied ? copiedLabel : label}
    </button>
  );
}
