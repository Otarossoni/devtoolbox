"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  PasswordIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";
import { generatePassword, passwordEntropy } from "@/lib/hash";
import ToolPage, { ToolHeader, CardStack } from "@/components/ToolPage";
import Card, { AboutCard, FieldLabel } from "@/components/Card";
import { TextField, FieldError } from "@/components/Field";
import Button, { ToggleChip } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { OutputBox, Actions } from "@/components/Output";

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const entropy = useMemo(() => passwordEntropy(password, { uppercase, lowercase, numbers, symbols }), [password, uppercase, lowercase, numbers, symbols]);

  const entropyLabel = entropy < 40 ? "Weak" : entropy < 60 ? "Fair" : entropy < 80 ? "Strong" : "Very Strong";
  const entropyColor = entropy < 40 ? "bg-error" : entropy < 60 ? "bg-warning" : entropy < 80 ? "bg-success" : "bg-accent";

  const lengthInvalid = length < 8 || length > 128;
  const noCharset = !uppercase && !lowercase && !numbers && !symbols;

  const handleGenerate = useCallback(() => {
    // Keep the current password when no character class is selected
    if (!uppercase && !lowercase && !numbers && !symbols) return;
    setPassword(generatePassword(Math.max(8, Math.min(128, length || 8)), { uppercase, lowercase, numbers, symbols, excludeAmbiguous: true }));
    setCopied(false);
  }, [length, uppercase, lowercase, numbers, symbols]);

  // Generate on mount (client only, avoids hydration mismatch) and whenever the options change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = password;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  return (
    <ToolPage>
      <ToolHeader
        icon={PasswordIcon}
        title="Password Generator"
        description="Generate strong, random passwords"
      />

      <CardStack>
        <Card label="Options">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password-length">Length</FieldLabel>
              <TextField
                id="password-length"
                type="text"
                size="sm"
                inputMode="numeric"
                value={length}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (e.target.value === "") setLength(0);
                  else if (!isNaN(v)) setLength(v);
                }}
                invalid={lengthInvalid}
                className="w-20! text-center"
              />
            </div>
            <input
              type="range"
              aria-label="Length"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="h-control w-full cursor-pointer"
            />
            {lengthInvalid && <FieldError>Length must be between 8 and 128</FieldError>}
            <div className="flex justify-between">
              <span className="text-xs text-fg-tertiary">8</span>
              <span className="text-xs text-fg-tertiary">128</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "uppercase", value: uppercase, set: setUppercase, label: "A-Z" },
              { key: "lowercase", value: lowercase, set: setLowercase, label: "a-z" },
              { key: "numbers", value: numbers, set: setNumbers, label: "0-9" },
              { key: "symbols", value: symbols, set: setSymbols, label: "!@#$%" },
            ].map((t) => (
              <ToggleChip
                key={t.key}
                mono
                pressed={t.value}
                onClick={() => t.set(!t.value)}
              >
                {t.label}
              </ToggleChip>
            ))}
          </div>
        </Card>

        <Card label="Password">
          <OutputBox>
            <code className="font-mono text-base break-all text-fg select-all sm:text-lg" suppressHydrationWarning>
              {password}
            </code>
          </OutputBox>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>Entropy</FieldLabel>
              <span className="font-mono text-xs text-fg">{entropy.toFixed(0)} bits · {entropyLabel}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-field">
              <div
                className={`h-full rounded-full transition-all duration-300 ${entropyColor}`}
                style={{ width: `${Math.min(100, (entropy / 100) * 100)}%` }}
              />
            </div>
          </div>

          <Actions align="between">
            <CopyButton copied={copied} onClick={handleCopy} />
            <Button variant="primary" size="md" icon={ArrowClockwiseIcon} onClick={handleGenerate} disabled={noCharset}>
              Regenerate
            </Button>
          </Actions>
        </Card>

        <AboutCard title="About Password Generator">
          <p>
            Passwords are generated using cryptographically secure random
            values via the browser&rsquo;s native Web Crypto API. Nothing
            is stored or transmitted.
          </p>
          <p>
            <strong>Entropy</strong> estimates password strength in bits.
            Weak: below 40, Fair: 40–60, Strong: 60–80, Very Strong: 80+.
            Ambiguous characters (Il1O0) are always excluded to make
            passwords easier to read and type.
          </p>
        </AboutCard>
      </CardStack>
    </ToolPage>
  );
}
