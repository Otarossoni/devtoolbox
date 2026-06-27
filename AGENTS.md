# DevToolbox — Agent Guidelines

## Stack
- Next.js 16 (App Router + Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Phosphor Icons (SSR imports)

## Commands
```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run typecheck # TypeScript
```

## Git policy
- **Nunca commitar sem solicitação explícita e aprovação do usuário.**
- Só fazer commit, push ou qualquer operação git que altere o repositório remoto quando o usuário pedir explicitamente.

## Project conventions

### File structure
```
src/
├── app/
│   ├── layout.tsx         # Root layout (Sidebar + main)
│   ├── page.tsx           # Home page
│   └── tools/
│       ├── base64/        # Text, Image, PDF, File, Validator
│       ├── color/         # Converter, Palette, Contrast
│       ├── image/         # Converter, Resizer
│       ├── json/          # Formatter, CSV/YAML/XML, Diff, Path, Query String
│       ├── markdown/      # Editor, Table Generator
│       ├── security/      # Hash Generator, Password, JWT Decoder
│       ├── text/          # Case, Counter, Diff, Lorem, Replacer
│       ├── time/          # Timestamp, Calculator
│       ├── url/           # Encoder/Decoder, Parser
│       └── uuid/          # Generator, Bulk, Validator, Inspector
├── components/
│   ├── Sidebar.tsx
│   ├── CopyButton.tsx
│   └── ColorPicker.tsx
└── lib/
    ├── base64.ts          # Base64 encode/decode/validate
    ├── color.ts           # Color parsing, conversion, palette, contrast
    ├── hash.ts            # MD5, SHA-1, SHA-256/512, HMAC, password, JWT
    ├── json.ts            # JSON format/minify/highlight, diff, path, CSV/XML/QS
    ├── text.ts            # Case conversion, text diff (LCS)
    ├── time.ts            # Timestamp parsing, date math, relative formatting
    └── uuid.ts            # UUID generation (v1-v7), MD5, SHA-1, validation
```

### Component patterns
- All interactive pages are client components (`"use client"`)
- `useState` + `useCallback` + `useMemo` for state and handlers
- Random initial values use `useState(() => fn())` with `suppressHydrationWarning`
- Icons imported from `@phosphor-icons/react/dist/ssr`
- Tailwind arbitrary values for custom purple (`#8A2BE2`) and dark theme colors (`#0a0a0a`, `#262626`, `#171717`)

### Page layout pattern
```tsx
<div className="flex min-h-screen w-full flex-col items-center px-6 py-16 lg:py-24">
  <div className="w-full max-w-3xl">
    {/* Header: icon + title + subtitle, animate-5 */}
    {/* Controls/Input card: animate-7, rounded-xl border border-[#262626] bg-[#0a0a0a] p-6 mb-4 */}
    {/* Output/Result card: animate-9, same styling */}
    {/* About card: animate-10, same styling */}
  </div>
</div>
```
- **Width**: `max-w-3xl` (768px) default. Exception: Markdown Editor uses `max-w-6xl` (1152px) due to split view.
- Animate classes: `animate-5` (0.1s delay), `animate-7` (0.3s), `animate-9` (none, used for output), `animate-10` (0.4s).

### Copy button pattern
```tsx
<button
  onClick={handleCopy}
  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border ${
    copied
      ? "bg-green-500/10 text-green-400 border-green-500/30"
      : "bg-[#171717] text-neutral-400 border-[#262626] hover:text-[#8A2BE2] hover:border-[#8A2BE2]/30"
  }`}
>
  {copied ? <><CheckIcon className="h-3.5 w-3.5" /> Copied!</> : <><CopyIcon className="h-3.5 w-3.5" /> Copy</>}
</button>
```

### Mode-switch buttons
```tsx
<button
  onClick={() => setMode("option")}
  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
    mode === "option"
      ? "bg-[#0a0a0a] text-[#8A2BE2] border-[#8A2BE2]"
      : "bg-[#0a0a0a] text-neutral-400 border-[#262626] hover:text-[#ededed] hover:border-[#3a3a3a]"
  }`}
>
  Option
</button>
```

### File drop zones
```tsx
<div
  onDrop={handleDrop}
  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
  onDragLeave={() => setIsDragging(false)}
  onClick={() => fileInputRef.current?.click()}
  className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors duration-200 cursor-pointer min-h-[120px] ${
    isDragging ? "border-[#8A2BE2] bg-[#8A2BE2]/5" : "border-[#262626] hover:border-[#3a3a3a]"
  }`}
>
```
- Always pair with a hidden `<input ref={fileInputRef} type="file" ... className="hidden" />`

### Styling
- Dark theme only (no light mode)
- Purple accent: `#8A2BE2` for active states, borders, buttons
- Background hierarchy: `#000000` (body) > `#0a0a0a` (cards) > `#171717` (hover)
- Border: `#262626` default, `#8A2BE2` on focus/active
- Text: `#ededed` primary, `neutral-500` secondary, `neutral-600` tertiary
- Font: Geist Sans + Geist Mono

### Sidebar
- Tree structure with expand/collapse animation via `max-h` + `opacity` transitions
- Icons per category: `ArrowsLeftRightIcon` (Base64), `PaletteIcon` (Color), `ImageSquareIcon` (Image), `BracketsCurlyIcon` (JSON), `MarkdownLogoIcon` (Markdown), `ShieldCheckIcon` (Security), `TextAaIcon` (Text), `ClockIcon` (Time), `LinkSimpleIcon` (URL), `FingerprintSimpleIcon` (UUID)
- Version from `package.json` via dynamic import
- Footer: version + creator link

### Ordering
- **Categories** in sidebar and home page are sorted alphabetically (Base64, Color, Image, JSON, Markdown, Security, Text, Time, URL, UUID)
- **Items within a category** follow logical/usage order (e.g., Generator before Validator)

### Mode-switched pages
- Pages with 2 modes (encode/decode, JSON→CSV/CSV→JSON, etc.) **must preserve input across mode switches**
- Use **separate state variables** per mode (e.g., `jsonInput` + `csvInput`), not a shared `input`
- The `currentInput` is derived from `mode` and the corresponding state

### Common pitfalls
- **Hydration errors**: `crypto.getRandomValues()`, `Date.now()`, `Math.random()` in initial state produce different values on server vs client. Use `useEffect` + `suppressHydrationWarning`, or lazy initializer `useState(() => fn())`
- **Turbopack cache corruption**: If the dev server shows "Persisting failed" or "Compaction failed", run `rm -rf .next && npm run dev`
- **HTML escape pipeline**: When building markdown/HTML parsers, generate HTML BEFORE the final `escapeHTML()` call, or use a placeholder-protection system. Never escape HTML tags that you just created.
- **Canvas-based tools**: Use `URL.createObjectURL(file)` immediately after getting the File reference. Don't rely on React state for the file object in canvas operations — state updates are batched and may not have propagated yet.