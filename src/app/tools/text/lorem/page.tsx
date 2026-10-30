"use client";

import { useState, useCallback } from "react";
import {
  TextTIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField, TextArea } from "@/components/Field";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

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

/** The corpus has entries with more than one sentence; split them so counts are exact */
const SINGLE_SENTENCES = SENTENCES.flatMap((s) => s.match(/[^.!?]+[.!?]/g)?.map((x) => x.trim()) ?? [s]);

function generateSentences(count: number): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pickRandom(SINGLE_SENTENCES));
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
    <ToolPage>
      <ToolHeader
        icon={TextTIcon}
        title="Lorem Ipsum"
        description="Generate placeholder text for designs and mockups"
      />

      <CardStack>
        <Card label="Options">
          <SegmentedControl
            ariaLabel="Type"
            layout="grid"
            value={loremType}
            onChange={(v) => {
              setLoremType(v);
              setGenerated(false);
              setCount(v === "words" ? 20 : 3);
            }}
            options={types.map((t) => ({ value: t.value, label: t.label, hint: t.hint }))}
          />
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <FieldLabel htmlFor="lorem-count">Count</FieldLabel>
              <TextField
                id="lorem-count"
                type="number"
                value={count}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setCount(Math.max(1, Math.min(100, v)));
                }}
                min={1}
                max={100}
              />
            </div>
            <Button variant="primary" size="md" onClick={handleGenerate}>
              Generate
            </Button>
          </div>
        </Card>

        {generated && (
          <Card label="Output">
            <TextArea
              value={output}
              readOnly
              rows={10}
              mono={false}
              aria-label="Output"
              className="leading-relaxed!"
            />
            <Actions>
              <CopyButton copied={copied} onClick={handleCopy} />
              <Button icon={DownloadSimpleIcon} onClick={handleDownload}>
                Download .txt
              </Button>
            </Actions>
          </Card>
        )}

        <AboutCard title="About Lorem Ipsum">
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
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
