import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";

const fieldBase =
  "w-full min-w-0 rounded-control text-fg placeholder:text-fg-tertiary transition-colors disabled:cursor-not-allowed disabled:opacity-40";

function fieldFill(invalid?: boolean) {
  return invalid ? "bg-field-error" : "bg-field";
}

/* 16px on small screens avoids iOS zoom on focus */
function fieldFont(mono: boolean) {
  return mono ? "font-mono text-base sm:text-sm" : "text-base sm:text-sm";
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  /** Geist Mono for code/data values (default) */
  mono?: boolean;
  /** "sm" is a 36px compact field */
  size?: "md" | "sm";
  ref?: React.Ref<HTMLInputElement>;
}

export function TextField({
  invalid,
  mono = true,
  size = "md",
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${fieldBase} ${fieldFill(invalid)} ${fieldFont(mono)} ${
        size === "sm" ? "h-control-sm px-3" : "h-control px-4"
      } ${className}`}
      {...props}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  mono?: boolean;
}

export function TextArea({ invalid, mono = true, className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${fieldBase} ${fieldFill(invalid)} ${fieldFont(mono)} resize-none px-4 py-3.5 leading-[1.6] ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  invalid?: boolean;
  mono?: boolean;
  size?: "md" | "sm";
  children: ReactNode;
}

export function Select({
  invalid,
  mono = false,
  size = "md",
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className={`relative flex ${className}`}>
      <select
        aria-invalid={invalid || undefined}
        className={`w-full min-w-0 cursor-pointer appearance-none text-fg-secondary transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 ${
          invalid ? "bg-field-error" : "bg-surface-elevated"
        } ${mono ? "font-mono" : ""} ${
          size === "sm"
            ? "h-control-sm rounded-segment pr-8 pl-3.5 text-[13px] font-medium"
            : "h-control rounded-control pr-9 pl-4 text-base font-medium sm:text-sm"
        }`}
        {...props}
      >
        {children}
      </select>
      <CaretDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-[13px] -translate-y-1/2 text-fg-secondary"
      />
    </div>
  );
}

/** Message below an invalid field */
export function FieldError({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs text-error ${className}`}>{children}</p>;
}
