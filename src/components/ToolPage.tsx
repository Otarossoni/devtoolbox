import type { ComponentType, ReactNode } from "react";

interface ToolPageProps {
  /** "wide" (1152px) is reserved for split views such as the Markdown Editor */
  width?: "default" | "wide";
  children: ReactNode;
}

export default function ToolPage({ width = "default", children }: ToolPageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 pt-20 pb-16 lg:py-24">
      <div className={`page-enter w-full ${width === "wide" ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </div>
    </div>
  );
}

interface ToolHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  description: ReactNode;
}

export function ToolHeader({ icon: Icon, title, description }: ToolHeaderProps) {
  return (
    <header className="mb-8 flex items-center gap-3.5">
      <div className="flex size-11 flex-none items-center justify-center rounded-control bg-accent-tint text-accent">
        <Icon className="size-[22px]" />
      </div>
      <div className="min-w-0">
        <h1 className="text-[22px] leading-[1.2] font-bold tracking-[-0.025em] text-fg">{title}</h1>
        <p className="mt-0.5 text-sm text-fg-secondary">{description}</p>
      </div>
    </header>
  );
}

/** Vertical stack of cards with the standard 16px gap */
export function CardStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
