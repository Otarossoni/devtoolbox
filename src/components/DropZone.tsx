import type { ComponentType, DragEvent, ReactNode } from "react";

interface DropZoneProps {
  isDragging: boolean;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  /** Opens the file picker — pair with a hidden <input type="file" /> */
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  /** File name once loaded, otherwise the idle instruction */
  title: ReactNode;
  meta?: ReactNode;
  /** A file is loaded: title in mono, icon in accent */
  loaded?: boolean;
}

/** Filled block, r14, min-height 144 — fill shifts on hover, purple tint while dragging */
export default function DropZone({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  icon: Icon,
  title,
  meta,
  loaded = false,
}: DropZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group pressable flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-tile p-8 text-center transition ${
        isDragging ? "bg-accent-tint" : "bg-field hover:bg-field-hover"
      }`}
    >
      <Icon
        className={`size-8 transition-colors ${
          loaded || isDragging ? "text-accent" : "text-fg-subtle group-hover:text-fg-secondary"
        }`}
      />
      <span
        className={
          loaded
            ? "font-mono text-sm break-all text-fg"
            : `text-[13px] transition-colors ${isDragging ? "text-fg" : "text-fg-secondary group-hover:text-fg"}`
        }
      >
        {title}
      </span>
      {meta && <span className="text-[13px] text-fg-secondary">{meta}</span>}
    </div>
  );
}
