"use client";

import { useState, useCallback } from "react";
import {
  TextTIcon,
  CopyIcon,
  CheckIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus, id aliquet eros bibendum vel.",
  "Nulla facilisi. Sed vehicula, nisl eget ultricies tincidunt, nisi nisl aliquam nisl, vel aliquet nisl nisl sit amet nisl.",
  "Vivamus euismod, nisl quis tincidunt tincidunt, nisl nisl aliquam nisl, vel aliquet nisl nisl sit amet nisl.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.",
  "Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est.",
  "Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.",
  "Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi.",
  "Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.",
  "Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus.",
  "Tortor neque egestas augue, eu vulputate magna eros eu erat.",
  "Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.",
  "Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus.",
  "Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.",
  "Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc.",
  "Sed adipiscing ornare risus. Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit.",
  "Mauris eget neque at sem venenatis eleifend. Ut nonummy. Fusce aliquet pede non pede.",
  "Suspendisse dapibus lorem pellentesque magna. Integer nulla. Donec blandit feugiat ligula.",
  "Donec hendrerit, felis et imperdiet euismod, purus ipsum pretium metus, in lacinia nulla nisl eget sapien.",
  "Suspendisse ac urna. Etiam pellentesque mauris ut lectus.",
  "Nunc consequat felis vitae quam. Suspendisse dapibus, metus quis tincidunt aliquet.",
  "Orci odio sollicitudin ligula, sit amet tincidunt magna sem in est. Ut lorem.",
  "Morbi quam dui, pulvinar ac, consectetur in, aliquet at, elit. Sed molestie.",
  "Integer quis felis. Mauris nec libero. Suspendisse ut nibh. Etiam ut purus.",
  "Sed tempus porttitor ligula. Phasellus feugiat, mi eu consequat convallis, arcu eros tincidunt lorem.",
  "Cras nec ante. Pellentesque a nulla. Cum sociis natoque penatibus et magnis dis parturient montes.",
  "Nascetur ridiculus mus. Aliquam tincidunt urna. Nulla ullamcorper vestibulum turpis.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSentences(count: number): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pickRandom(SENTENCES));
  }
  return out.join(" ");
}

function generateParagraphs(count: number): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const sentences = 3 + Math.floor(Math.random() * 5);
    const para: string[] = [];
    for (let j = 0; j < sentences; j++) {
      para.push(pickRandom(SENTENCES));
    }
    out.push(para.join(" "));
  }
  return out.join("\n\n");
}

function generateWords(count: number): string {
  const wordSet = new Set<string>();
  for (const s of SENTENCES) {
    for (const w of s.replace(/[.,;:]/g, "").split(" ")) {
      if (w.length > 1) wordSet.add(w);
    }
  }
  const words = Array.from(wordSet);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pickRandom(words));
  }
  return out.join(" ");
}

function generate(type: "paragraphs" | "sentences" | "words", count: number): string {
  switch (type) {
    case "sentences":
      return generateSentences(count);
    case "paragraphs":
      return generateParagraphs(count);
    case "words":
      return generateWords(count);
  }
}

type LoremType = "paragraphs" | "sentences" | "words";

export default function LoremIpsumPage() {
  const [loremType, setLoremType] = useState<LoremType>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setOutput(generate(loremType, count));
    setGenerated(true);
  }, [loremType, count]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-ipsum.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const types: { value: LoremType; label: string; hint: string }[] = [
    { value: "paragraphs", label: "Paragraphs", hint: "blocks of text" },
    { value: "sentences", label: "Sentences", hint: "single sentences" },
    { value: "words", label: "Words", hint: "individual words" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <TextTIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Lorem Ipsum</h1>
            <p className="text-sm text-neutral-500">
              Generate placeholder text for designs and mockups
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Options
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setLoremType(t.value);
                  setGenerated(false);
                  setCount(t.value === "words" ? 20 : 3);
                }}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer border ${
                  loremType === t.value
                    ? "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
                }`}
              >
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-[10px] text-neutral-600">{t.hint}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">
                Count
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setCount(Math.max(1, Math.min(100, v)));
                }}
                min={1}
                max={100}
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>

        {generated && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Output
              </span>
            </div>

            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm text-[#ededed] outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  copied
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#171717] text-neutral-400 border border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30 transition-all duration-200 cursor-pointer"
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                Download .txt
              </button>
            </div>
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Lorem Ipsum</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Lorem Ipsum is the standard placeholder text in design, publishing,
              and web development since the 1500s. It approximates natural
              language without readable content, keeping the focus on layout.
            </p>
            <p>
              <strong>Paragraphs</strong> — blocks of 3–7 sentences each,
              separated by blank lines.{" "}
              <strong>Sentences</strong> — individual sentences from the
              expanded Lorem Ipsum corpus.{" "}
              <strong>Words</strong> — random individual words in Latin style.
            </p>
            <p>
              Click <strong>Generate</strong> to create new text,{" "}
              <strong>Copy</strong> to clipboard, or{" "}
              <strong>Download .txt</strong> to save as a file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
