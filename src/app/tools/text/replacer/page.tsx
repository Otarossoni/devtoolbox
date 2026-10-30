"use client";

import { useState, useCallback } from "react";
import {
  RepeatIcon,
} from "@phosphor-icons/react/dist/ssr";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel, CardMeta } from "@/components/Card";
import { TextField, TextArea, FieldError } from "@/components/Field";
import Button, { ToggleChip } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { Actions } from "@/components/Output";

export default function TextReplacerPage() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [flags, setFlags] = useState({ g: true, i: false });
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const flagsStr = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("");

  const handleReplaceAll = useCallback(() => {
    if (!find) return;
    setError("");

    if (useRegex) {
      try {
        // Replace All is always global; avoid a duplicate "g" when the flag is already on
        const regex = new RegExp(find, flagsStr.includes("g") ? flagsStr : flagsStr + "g");
        const matches = text.match(regex);
        setCount(matches ? matches.length : 0);
        setOutput(text.replace(regex, replace));
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    } else {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = text.match(new RegExp(escaped, "g"));
      setCount(matches ? matches.length : 0);
      setOutput(text.split(find).join(replace));
    }
  }, [text, find, replace, useRegex, flagsStr]);

  const handleReplaceFirst = useCallback(() => {
    if (!find) return;
    setError("");

    if (useRegex) {
      try {
        // Without "g", replace() touches only the first match and expands $1, $& like Replace All
        const regex = new RegExp(find, flagsStr.replace("g", ""));
        if (!regex.test(text)) {
          setCount(0);
          setOutput(text);
          return;
        }
        setCount(1);
        setOutput(text.replace(regex, replace));
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    } else {
      const idx = text.indexOf(find);
      if (idx === -1) {
        setCount(0);
        setOutput(text);
        return;
      }
      setCount(1);
      setOutput(
        text.slice(0, idx) + replace + text.slice(idx + find.length),
      );
    }
  }, [text, find, replace, useRegex, flagsStr]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    setOutput("");
    setCount(0);
    setError("");
  }, []);

  const handleFindChange = useCallback((value: string) => {
    setFind(value);
    setOutput("");
    setCount(0);
    setError("");
  }, []);

  const handleReplaceChange = useCallback((value: string) => {
    setReplace(value);
    setOutput("");
    setCount(0);
  }, []);

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

  return (
    <ToolPage>
      <ToolHeader
        icon={RepeatIcon}
        title="Text Replacer"
        description="Find and replace text with plain or regex search"
      />

      <CardStack>
        <Card label="Text">
          <TextArea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type or paste text here..."
            rows={10}
          />
        </Card>

        <Card label="Search & Replace">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="replacer-find">Find</FieldLabel>
              <TextField
                id="replacer-find"
                value={find}
                onChange={(e) => handleFindChange(e.target.value)}
                placeholder="Text or pattern..."
                invalid={!!error}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="replacer-replace">Replace with</FieldLabel>
              <TextField
                id="replacer-replace"
                value={replace}
                onChange={(e) => handleReplaceChange(e.target.value)}
                placeholder="Replacement..."
              />
            </div>
          </div>

          {error && (
            <FieldError className="font-mono">{error}</FieldError>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <ToggleChip mono pressed={useRegex} onClick={() => setUseRegex(!useRegex)}>
              .* regex
            </ToggleChip>
            {useRegex && (
              <div className="flex gap-1">
                {["g", "i"].map((f) => (
                  <ToggleChip
                    key={f}
                    square
                    mono
                    aria-label={`Flag ${f}`}
                    pressed={flags[f as keyof typeof flags]}
                    onClick={() =>
                      setFlags((prev) => ({
                        ...prev,
                        [f]: !prev[f as keyof typeof flags],
                      }))
                    }
                  >
                    {f}
                  </ToggleChip>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="md" onClick={handleReplaceFirst} disabled={!find}>
              Replace First
            </Button>
            <Button variant="primary" size="md" onClick={handleReplaceAll} disabled={!find}>
              Replace All
            </Button>
          </div>
        </Card>

        {output && (
          <Card
            label="Result"
            actions={<CardMeta>{count} replacement{count !== 1 ? "s" : ""}</CardMeta>}
          >
            <TextArea
              value={output}
              readOnly
              rows={10}
              aria-label="Result"
            />
            <Actions>
              <CopyButton copied={copied} onClick={handleCopy} />
            </Actions>
          </Card>
        )}

        <AboutCard title="About Text Replacer">
          <p>
            Find and replace text using plain string matching or regular
            expressions with live result and replacement count.
          </p>
          <p>
            <strong>Replace First</strong> — replaces only the first
            occurrence. <strong>Replace All</strong> — replaces every match.
          </p>
          <p>
            Enable <strong>regex</strong> to use regular expression patterns.
            The <strong>g</strong> flag applies globally (always on for
            Replace All), and <strong>i</strong> makes matching
            case-insensitive.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
