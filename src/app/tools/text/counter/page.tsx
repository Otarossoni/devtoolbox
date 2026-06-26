"use client";

import { useState, useMemo } from "react";
import { TextboxIcon } from "@phosphor-icons/react/dist/ssr";

const cardStyles =
  "rounded-lg bg-[#171717] border border-[#262626] p-4 flex flex-col items-center gap-1";

const valueStyles = "text-2xl font-mono font-semibold text-[#8A2BE2] leading-none";
const labelStyles = "text-[11px] text-neutral-500 uppercase tracking-wider text-center";

export default function CharacterCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.replace(/\n/g, "").length;
    const spaces = (text.match(/ /g) || []).length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const trimmed = text.replace(/\n+$/, "");
    const lines = trimmed.length === 0 ? 0 : trimmed.split("\n").length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((b) => b.trim()).length;
    const bytes = new TextEncoder().encode(text).length;
    const readingTime = Math.ceil(words / 200);

    return { chars, spaces, words, lines, sentences, paragraphs, bytes, readingTime };
  }, [text]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <TextboxIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Character Counter</h1>
            <p className="text-sm text-neutral-500">
              Count characters, words, lines, and more in real time
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Input
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here..."
            rows={12}
            className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
          />
        </div>

        <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Statistics
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.chars.toLocaleString()}</span>
              <span className={labelStyles}>Characters</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.spaces.toLocaleString()}</span>
              <span className={labelStyles}>Spaces</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.words.toLocaleString()}</span>
              <span className={labelStyles}>Words</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.lines.toLocaleString()}</span>
              <span className={labelStyles}>Lines</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.sentences.toLocaleString()}</span>
              <span className={labelStyles}>Sentences</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.paragraphs.toLocaleString()}</span>
              <span className={labelStyles}>Paragraphs</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>~{stats.readingTime} min</span>
              <span className={labelStyles}>Reading time</span>
            </div>
            <div className={cardStyles}>
              <span className={valueStyles}>{stats.bytes.toLocaleString()}</span>
              <span className={labelStyles}>Bytes</span>
            </div>
          </div>
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Character Counter</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Real-time text statistics updated as you type. Everything runs
              locally in your browser — no text is ever sent anywhere.
            </p>
            <p>
              <strong>Characters</strong> — total count, newlines excluded. <strong>Spaces</strong> — number of space characters.{" "}
              <strong>Words</strong> — split by whitespace boundaries.{" "}
              <strong>Lines</strong> — count of newline-separated rows.
            </p>
            <p>
              <strong>Sentences</strong> — split by <code className="text-xs text-neutral-500">. ! ?</code>.{" "}
              <strong>Paragraphs</strong> — blocks separated by blank lines.{" "}
              <strong>Reading time</strong> — estimated at 200 words per minute.{" "}
              <strong>Bytes</strong> — UTF-8 encoded size in bytes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
