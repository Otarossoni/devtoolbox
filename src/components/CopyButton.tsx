"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-green-500/10 text-green-400 border border-green-500/30"
          : "bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
      } ${className}`}
      aria-label={copied ? "Copiado!" : "Copiar"}
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5" />
          Copiado!
        </>
      ) : (
        <>
          <CopyIcon className="h-3.5 w-3.5" />
          Copiar
        </>
      )}
    </button>
  );
}
