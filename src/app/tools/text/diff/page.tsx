"use client";

import { useState, useCallback } from "react";
import { GitDiffIcon } from "@phosphor-icons/react/dist/ssr";
import { computeDiff } from "@/lib/text";

export default function DiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<ReturnType<typeof computeDiff> | null>(null);

  const handleCompare = useCallback(() => {
    setDiff(computeDiff(left, right));
  }, [left, right]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-3xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <GitDiffIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Diff Checker</h1>
            <p className="text-sm text-neutral-500">
              Compare two texts line by line
            </p>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Original
                </span>
              </div>
              <textarea
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                placeholder="Paste original text..."
                rows={10}
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                  Modified
                </span>
              </div>
              <textarea
                value={right}
                onChange={(e) => setRight(e.target.value)}
                placeholder="Paste modified text..."
                rows={10}
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleCompare}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              <GitDiffIcon className="h-4 w-4" />
              Compare
            </button>
          </div>
        </div>

        {diff && (
          <div className="animate-9 rounded-xl border border-[#262626] bg-[#0a0a0a] mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Diff
              </span>
              <span className="text-xs text-neutral-600">
                {diff.length} lines
              </span>
            </div>

            {diff.length > 0 ? (
              <div className="overflow-auto max-h-96">
                <table className="w-full text-xs font-mono">
                  <tbody>
                    {diff.map((line, i) => (
                      <tr
                        key={i}
                        className={
                          line.type === "add"
                            ? "bg-green-500/10"
                            : line.type === "remove"
                              ? "bg-red-500/10"
                              : ""
                        }
                      >
                        <td className="w-8 text-right text-neutral-600 px-2 py-0.5 select-none border-r border-[#262626]">
                          {line.leftLine ?? ""}
                        </td>
                        <td className="w-8 text-right text-neutral-600 px-2 py-0.5 select-none border-r border-[#262626]">
                          {line.rightLine ?? ""}
                        </td>
                        <td
                          className={`w-4 text-center px-1 py-0.5 select-none ${
                            line.type === "add"
                              ? "text-green-500"
                              : line.type === "remove"
                                ? "text-red-500"
                                : "text-neutral-600"
                          }`}
                        >
                          {line.type === "add" ? "+" : line.type === "remove" ? "-" : ""}
                        </td>
                        <td
                          className={`px-3 py-0.5 whitespace-pre-wrap break-all ${
                            line.type === "add"
                              ? "text-green-400"
                              : line.type === "remove"
                                ? "text-red-400"
                                : "text-[#ededed]"
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
              <div className="text-center py-8 px-6">
                <span className="text-sm text-neutral-500">
                  Texts are identical — no differences found.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About Diff</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              Compare two texts line by line using the Longest Common
              Subsequence (LCS) algorithm.
            </p>
            <p>
              <span className="text-red-400">Red lines</span> were removed
              from the original. <span className="text-green-400">Green lines</span>{" "}
              were added in the modified version. Unchanged lines remain in
              the default color.
            </p>
            <p>
              Line numbers on the left refer to the original text; numbers on
              the right refer to the modified text. No external dependencies
              — the diff runs entirely in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
