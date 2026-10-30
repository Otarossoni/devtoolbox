"use client";

import { useState, useMemo } from "react";
import { TextboxIcon } from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard } from "@/components/Card";
import { TextArea } from "@/components/Field";

const cardStyles =
  "flex flex-col items-center justify-center gap-2 rounded-control bg-surface-elevated px-3 py-4";
const valueStyles = "font-mono text-2xl font-semibold leading-none text-accent";
const labelStyles = "text-center text-xs font-medium text-fg-secondary";

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
    <ToolPage>
      <ToolHeader
        icon={TextboxIcon}
        title="Character Counter"
        description="Count characters, words, lines, and more in real time"
      />

      <CardStack>
        <Card label="Input">
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here..."
            rows={12}
          />
        </Card>

        <Card label="Statistics">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        </Card>

        <AboutCard title="About Character Counter">
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
            <strong>Sentences</strong> — split by <code>. ! ?</code>.{" "}
            <strong>Paragraphs</strong> — blocks separated by blank lines.{" "}
            <strong>Reading time</strong> — estimated at 200 words per minute.{" "}
            <strong>Bytes</strong> — UTF-8 encoded size in bytes.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
