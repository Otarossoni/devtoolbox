"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FingerprintSimpleIcon,
  ArrowClockwiseIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  generateUUID,
  generateUUIDv3,
  generateUUIDv5,
  NAMESPACE_DNS,
  NAMESPACE_URL,
  NAMESPACE_OID,
  NAMESPACE_X500,
  type UUIDVersion,
} from "@/lib/uuid";

const versions: {
  value: UUIDVersion;
  label: string;
  description: string;
}[] = [
  { value: "v1", label: "v1", description: "Timestamp + MAC" },
  { value: "v3", label: "v3", description: "MD5 + namespace" },
  { value: "v4", label: "v4", description: "Random" },
  { value: "v5", label: "v5", description: "SHA-1 + namespace" },
  { value: "v6", label: "v6", description: "Reordered timestamp" },
  { value: "v7", label: "v7", description: "Unix timestamp" },
];

const namespaces = [
  { value: NAMESPACE_DNS, label: "DNS" },
  { value: NAMESPACE_URL, label: "URL" },
  { value: NAMESPACE_OID, label: "OID" },
  { value: NAMESPACE_X500, label: "X.500" },
];

const needsInput = (v: UUIDVersion) => v === "v3" || v === "v5";

export default function UUIDGeneratorPage() {
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [uuid, setUuid] = useState("");
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState(NAMESPACE_DNS);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setUuid(generateUUID("v4"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const doGenerate = (v: UUIDVersion, n: string, ns: string) => {
    if (v === "v3") return generateUUIDv3(ns, n);
    if (v === "v5") return generateUUIDv5(ns, n);
    return generateUUID(v);
  };

  const handleGenerate = () => {
    setUuid(doGenerate(version, name, namespace));
    setCopied(false);
  };

  const handleCopy = useCallback(async () => {
    if (!uuid) return;
    try {
      await navigator.clipboard.writeText(uuid);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = uuid;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [uuid]);

  const handleVersionChange = useCallback((v: UUIDVersion) => {
    setVersion(v);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
      <div className="w-full max-w-2xl">
        <div className="animate-5 flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#8A2BE2]">
            <FingerprintSimpleIcon className="h-5 w-5 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">UUID Generator</h1>
            <p className="text-sm text-neutral-500">
              Generate universally unique identifiers
            </p>
          </div>
        </div>

        <div className="animate-5 flex gap-2 mb-6 flex-wrap">
          {versions.map((v) => (
            <button
              key={v.value}
              onClick={() => handleVersionChange(v.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
                version === v.value
                  ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
                  : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
              }`}
            >
              <span className="font-mono">{v.label}</span>
              <span className="hidden sm:inline text-xs text-neutral-500 ml-1.5">
                {v.description}
              </span>
            </button>
          ))}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            needsInput(version)
              ? "max-h-60 opacity-100 mb-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-xl border border-[#262626] bg-[#0a0a0a] p-4 space-y-3">
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">
                Namespace
              </label>
              <select
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm text-[#ededed] outline-none focus:border-[#8A2BE2] transition-colors duration-200 cursor-pointer appearance-none bg-size-3 bg-position-[right_12px_center] bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23737373' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              >
                {namespaces.map((ns) => (
                  <option key={ns.label} value={ns.value}>
                    {ns.label}{ns.label === "DNS" ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name..."
                className="w-full px-3 py-2 rounded-lg bg-black border border-[#262626] text-sm font-mono text-[#ededed] placeholder:text-neutral-600 outline-none focus:border-[#8A2BE2] transition-colors duration-200"
              />
              {name && (
                <p className="text-xs text-neutral-600 mt-1">
                  Same namespace + name always produces the same UUID
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="animate-7 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Result
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-black border border-[#262626] min-h-14">
            {uuid ? (
              <code className="text-base sm:text-lg font-mono text-[#ededed] break-all select-all">
                {uuid}
              </code>
            ) : (
              <span className="text-sm text-neutral-600">
                Click &quot;Generate&quot; to create a UUID
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              onClick={handleCopy}
              disabled={!uuid}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
                copied
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : uuid
                    ? "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
                    : "bg-[#111] text-neutral-600 border-[#1a1a1a] cursor-not-allowed"
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
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-[#8A2BE2] text-white hover:bg-[#7a1fd1] transition-all duration-200 cursor-pointer"
            >
              <ArrowClockwiseIcon className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </div>

        <div className="animate-10 rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
          <h2 className="text-sm font-semibold mb-3">About versions</h2>
          <div className="space-y-3 text-sm text-neutral-400">
            <div>
              <span className="font-mono text-[#8A2BE2]">v1</span>{" "}
              &mdash; Based on timestamp and MAC address. Useful when
              you need time-based ordering with machine identification.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v3</span>{" "}
              &mdash; Based on MD5 hash of a namespace + name. Deterministic:
              same namespace + name always produces the same UUID.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v4</span>{" "}
              &mdash; Randomly generated. The most common and recommended
              version for most use cases.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v5</span>{" "}
              &mdash; Same as v3, but uses SHA-1 instead of MD5. More secure
              and also deterministic.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v6</span>{" "}
              &mdash; Reordered timestamp for lexicographic sorting.
              Compatible with v1, but better for database indexes.
            </div>
            <div>
              <span className="font-mono text-[#8A2BE2]">v7</span>{" "}
              &mdash; Unix timestamp in milliseconds + random bits. Ideal
              for database primary keys.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
