"use client";

import { useState, useCallback } from "react";
import { GitDiffIcon } from "@phosphor-icons/react/dist/ssr";
import { computeDiff } from "@/lib/text";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel, CardMeta } from "@/components/Card";
import { TextArea } from "@/components/Field";
import Button from "@/components/Button";
import { Actions } from "@/components/Output";

export default function DiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<ReturnType<typeof computeDiff> | null>(null);

  const handleCompare = useCallback(() => {
    setDiff(computeDiff(left, right));
  }, [left, right]);

  return (
    <ToolPage>
      <ToolHeader
        icon={GitDiffIcon}
        title="Diff Checker"
        description="Compare two texts line by line"
      />

      <CardStack>
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="diff-left">Original</FieldLabel>
              <TextArea
                id="diff-left"
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                placeholder="Paste original text..."
                rows={10}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="diff-right">Modified</FieldLabel>
              <TextArea
                id="diff-right"
                value={right}
                onChange={(e) => setRight(e.target.value)}
                placeholder="Paste modified text..."
                rows={10}
              />
            </div>
          </div>
          <Actions align="center">
            <Button variant="primary" size="md" icon={GitDiffIcon} onClick={handleCompare}>
              Compare
            </Button>
          </Actions>
        </Card>

        {diff && (
          <Card label="Diff" actions={<CardMeta>{diff.length} lines</CardMeta>}>
            {diff.some((line) => line.type !== "same") ? (
              <div className="max-h-96 overflow-auto rounded-control bg-field py-2">
                <table className="w-full font-mono text-xs">
                  <tbody>
                    {diff.map((line, i) => (
                      <tr
                        key={i}
                        className={
                          line.type === "add"
                            ? "bg-success-tint"
                            : line.type === "remove"
                              ? "bg-error-tint"
                              : ""
                        }
                      >
                        <td className="w-8 px-2 py-0.5 text-right text-fg-tertiary select-none">
                          {line.leftLine ?? ""}
                        </td>
                        <td className="w-8 px-2 py-0.5 text-right text-fg-tertiary select-none">
                          {line.rightLine ?? ""}
                        </td>
                        <td
                          className={`w-4 px-1 py-0.5 text-center select-none ${
                            line.type === "add"
                              ? "text-success"
                              : line.type === "remove"
                                ? "text-error"
                                : "text-fg-tertiary"
                          }`}
                        >
                          {line.type === "add" ? "+" : line.type === "remove" ? "-" : ""}
                        </td>
                        <td
                          className={`px-3 py-0.5 break-all whitespace-pre-wrap ${
                            line.type === "add"
                              ? "text-success"
                              : line.type === "remove"
                                ? "text-error"
                                : "text-fg"
                          }`}
                        >
                          {line.text}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <span className="text-sm text-fg-secondary">
                  Texts are identical — no differences found.
                </span>
              </div>
            )}
          </Card>
        )}

        <AboutCard title="About Diff">
          <p>
            Compare two texts line by line using the Longest Common
            Subsequence (LCS) algorithm.
          </p>
          <p>
            <span className="text-error">Red lines</span> were removed
            from the original. <span className="text-success">Green lines</span>{" "}
            were added in the modified version. Unchanged lines remain in
            the default color.
          </p>
          <p>
            Line numbers on the left refer to the original text; numbers on
            the right refer to the modified text. No external dependencies
            — the diff runs entirely in your browser.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
