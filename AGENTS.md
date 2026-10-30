# DevToolbox — Agent Guidelines

## Stack
- Next.js 16 (App Router + Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS 4 (design tokens in `src/app/globals.css` via `@theme`)
- Phosphor Icons (SSR imports)
- Fonts: Inter (UI) + Geist Mono (code/data), self-hosted via `next/font/google`

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
│   ├── globals.css        # Design tokens (@theme), focus, hover, motion utilities
│   ├── layout.tsx         # Root layout (Sidebar + main), loads Inter + Geist Mono
│   ├── page.tsx           # Home page
│   ├── icon.svg           # Favicon (DevToolbox mark)
│   ├── apple-icon.tsx     # 180px home-screen icon (next/og)
│   └── tools/
│       ├── base64/        # Text, Image, PDF, File, Validator
│       ├── color/         # Converter, Palette, Contrast
│       ├── image/         # Converter, Resizer, Extractor
│       ├── json/          # Formatter, CSV/YAML/XML, Query String, Diff, Path
│       ├── markdown/      # Editor, Table Generator
│       ├── number/        # Base Converter, Bitwise Calculator, ASCII Table
│       ├── qrcode/        # Generator
│       ├── security/      # Hash Generator, Password, JWT Decoder
│       ├── text/          # Case, Counter, Diff, HTML Entities, Lorem, Replacer, Slug
│       ├── time/          # Timestamp, Calculator, Cron Parser
│       ├── url/           # Encoder/Decoder, Parser
│       └── uuid/          # Generator, Bulk, Validator, Inspector
├── components/
│   ├── Sidebar.tsx
│   ├── AppIcon.tsx        # DevToolbox mark (sidebar header)
│   ├── ToolPage.tsx       # ToolPage, ToolHeader, CardStack
│   ├── Card.tsx           # Card, ErrorCard, AboutCard, FieldLabel, CardMeta
│   ├── Field.tsx          # TextField, TextArea, Select, FieldError
│   ├── SegmentedControl.tsx
│   ├── Button.tsx         # Button, IconButton, ToggleChip
│   ├── CopyButton.tsx
│   ├── DropZone.tsx
│   ├── Output.tsx         # CodeBlock, OutputBox, OutputValue, OutputPlaceholder, Actions
│   ├── ValueRow.tsx       # ValueRow, ValueTile, Badge
│   └── ColorPicker.tsx
└── lib/
    ├── base64.ts          # Base64 encode/decode/validate
    ├── color.ts           # Color parsing, conversion, palette, contrast
    ├── hash.ts            # MD5, SHA-1, SHA-256/512, HMAC, password, JWT
    ├── json.ts            # JSON format/minify/highlight, diff, path, CSV/XML/QS
    ├── number.ts          # BigInt radix parsing, bitwise ops
    ├── text.ts            # Case conversion, text diff (LCS)
    ├── time.ts            # Timestamp parsing, date math, relative formatting
    └── uuid.ts            # UUID generation (v1-v7), MD5, SHA-1, validation
```

### Component patterns
- All interactive pages are client components (`"use client"`)
- `useState` + `useCallback` + `useMemo` for state and handlers
- Random initial values use `useState(() => fn())` with `suppressHydrationWarning`
- Icons imported from `@phosphor-icons/react/dist/ssr`
- **Never hardcode colors** — use the semantic tokens below. No `#8A2BE2`, `#262626`, `neutral-*` etc. in `src/app` or `src/components`
- Build pages from the shared components in `src/components`; add new variants there instead of copying class strings into pages

### Design tokens (`src/app/globals.css`)
Exposed to Tailwind through `@theme`, so they are used as utilities (`bg-surface`, `text-fg-secondary`, `rounded-card`, `h-control`…).

| Token | Utility | Use |
|---|---|---|
| `--color-background` | `bg-background` | Page (`#000` + 32px dot grid on `body`, same as otaviorossoni.com) |
| `--color-surface` | `bg-surface` | Sidebar, cards |
| `--color-surface-elevated` | `bg-surface-elevated` | Active segment/nav item, value rows, swatches, copy button |
| `--color-surface-hover` | `bg-surface-hover` | Sidebar hover |
| `--color-field` / `-hover` / `-error` | `bg-field`… | Inputs, textareas, code, segmented track, drop zone; invalid fill |
| `--color-fg` | `text-fg` | Titles, values |
| `--color-fg-secondary` | `text-fg-secondary` | Labels, body, descriptions |
| `--color-fg-tertiary` | `text-fg-tertiary` | Captions, placeholders, meta (AA on surface/field — avoid on elevated) |
| `--color-fg-subtle` | `text-fg-subtle` | Decorative only (carets, idle icons) — never text |
| `--color-accent` / `-hover` | `bg-accent`, `text-accent` | Primary button, icons, accent text on surface |
| `--color-accent-text` | `text-accent-text` | Accent text on elevated or tinted fills (AA) |
| `--color-accent-tint` | `bg-accent-tint` | Icon squares, dragging, selected rows |
| `--color-on-accent` | `text-on-accent` | Text on primary button |
| `--color-success` / `-tint` | `text-success`, `bg-success-tint` | “Copied”, valid states |
| `--color-error` / `-tint` | `text-error`, `bg-error-tint` | Validation errors |
| `--color-warning` / `-tint` | `text-warning` | Non-blocking warnings (padding, limits, changed values) |
| `--color-syntax-key/-string/-number` | `text-syntax-*` | JSON/code highlighting |
| `--color-data-1…5` | `bg-data-1/15 text-data-1` | Categorical data (UUID structure groups) |
| `--color-row-stripe` | `even:bg-row-stripe` | Alternating table rows |

- **Radii**: `rounded-card` 18 (sections, home cards) · `rounded-tile` 14 (tracks, drop zone, swatches) · `rounded-control` 12 (fields, buttons, icon squares) · `rounded-segment` 10 (segments, compact buttons) · `rounded-inline` 6 (inline code)
- **Spacing** (4px base): `p-card` 24 (`p-card-sm` 20 on mobile) · `h-control` 44 · `h-control-sm` 36 · `w-sidebar` 272. Cards are 16px apart (`CardStack`), 16px gap inside.
- **Motion**: transitions 200ms `ease-standard` (Tailwind default); `pressable` = scale(0.98) on press; `page-enter` = one 400ms fade + 8px rise on the page column (applied by `ToolPage` — no per-card stagger).
- **Syntax colors from `src/lib/json.ts`** (`highlightJSON`) are remapped to tokens by the `.code-syntax` rules in `globals.css`; `CodeBlock` adds that class.

### Shared components
| Component | Props | Notes |
|---|---|---|
| `ToolPage` | `width?: "default" \| "wide"` | `max-w-3xl` (768px); `wide` = `max-w-6xl` (1152px), only for the Markdown Editor |
| `ToolHeader` | `icon, title, description` | 44px tinted icon square, title 22/700 |
| `CardStack` | `children` | 16px vertical gap between cards |
| `Card` | `label?, actions?, tone?: "default" \| "error", className?` | Surface section; label 13/600 sentence case; `actions` sit right of the label |
| `ErrorCard` | `label?, children` | Red tint, mono message |
| `AboutCard` | `title, children` | Closes every page; `<strong>`/`<code>` styled automatically |
| `FieldLabel` | `htmlFor?, children` | Label above fields/sub-blocks |
| `CardMeta` | `children` | Counts, sizes, coordinates next to a label |
| `TextField` | input props + `invalid?, mono? (true), size?: "md" \| "sm"` | 44px (36px `sm`), field fill, red fill when invalid |
| `TextArea` | textarea props + `invalid?, mono? (true)` | Also used read-only for outputs (add `aria-label`) |
| `Select` | select props + `invalid?, mono?, size?` | Elevated fill with caret |
| `FieldError` | `children` | Message under an invalid field |
| `SegmentedControl` | `options: {value, label?, icon?, hint?, title?}[], value, onChange, ariaLabel, layout?: "inline" \| "grid", gridClassName?, mono?` | Every single-choice group (modes, formats, algorithms, versions). `role="radiogroup"` |
| `Button` | button props + `variant?: "primary" \| "secondary" \| "ghost", size?: "md" \| "sm", icon?` | Primary = accent fill; secondary = elevated fill (presets, “Now”, “Reset”, downloads) |
| `IconButton` | `icon, label, size?, variant?` | `label` is the required accessible name |
| `ToggleChip` | `pressed, square?, mono?, icon?` | On/off options (HMAC, regex flags, Locked, URL-safe). `aria-pressed` |
| `CopyButton` | `copied?, onClick?` (controlled) or `text?` (self-managed), `disabled?, label?, copiedLabel?, variant?: "button" \| "inline" \| "icon"` | Pass the page's own `copied` state and handler |
| `DropZone` | `isDragging, onDrop, onDragOver, onDragLeave, onClick, icon, title, meta?, loaded?` | Keyboard accessible; pair with a hidden `<input type="file" />` |
| `CodeBlock` | `html?` or `children`, `maxHeight?, tone?` | Mono 13/1.7 on field fill |
| `OutputBox` / `OutputValue` / `OutputPlaceholder` | `tone?` | Single-value results (encoded string, UUID, password) |
| `Actions` | `align?: "end" \| "between" \| "center"` | Row of output actions |
| `ValueRow` | `label, value, action?, truncate?, valueClassName?` | Label left, mono value right |
| `ValueTile` | `label, value, action?, size?, align?` | Label above value |
| `Badge` | `tone?, mono?` | Status pills |

### Page layout pattern
```tsx
<ToolPage>
  <ToolHeader icon={SomeIcon} title="Tool name" description="What it does" />
  <CardStack>
    <SegmentedControl ariaLabel="Mode" value={mode} onChange={setMode} options={[...]} />
    <Card label="Input">
      <TextArea value={input} onChange={...} invalid={!!error} />
    </Card>
    {error && <ErrorCard label="Error">{error}</ErrorCard>}
    {output && (
      <Card label="Output">
        <TextArea value={output} readOnly aria-label="Output" />
        <Actions><CopyButton copied={copied} onClick={handleCopy} /></Actions>
      </Card>
    )}
    <AboutCard title="About Tool">…</AboutCard>
  </CardStack>
</ToolPage>
```

### File drop zones
```tsx
<DropZone
  isDragging={isDragging}
  onDrop={handleDrop}
  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
  onDragLeave={() => setIsDragging(false)}
  onClick={() => fileInputRef.current?.click()}
  icon={ImageIcon}
  loaded={!!file}
  title={file ? file.name : "Drop an image or click to browse"}
  meta={file ? "Click or drop to change" : undefined}
/>
<input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
```

### Styling
- Dark theme only (no light mode)
- Separation by fill only — no borders, rules or dividers
- Font: Inter for UI, Geist Mono only for code/data values
- Minimum text size 12px (`text-xs`); no thin/light weights
- Hover styles only apply inside `@media (hover: hover) and (pointer: fine)` — the `hover:` variant is redefined in `globals.css`
- Focus: global `:focus-visible` → 2px accent outline, 2px offset. Don't remove outlines
- Targets ≥ 44px; 36px controls use the `hit-area` utility to extend to 44px
- `prefers-reduced-motion` disables animations and transitions globally
- Icon-only buttons need an accessible name (`IconButton label`, `aria-label`)
- Contrast AA: use `text-accent-text` (not `text-accent`) on elevated/tinted fills; `text-fg-subtle` is never text

### Sidebar
- 272px surface panel (`w-sidebar bg-surface`); mobile: 44px menu button, drawer over a 60% scrim, slide 200ms
- Header: 36px `AppIcon` + name and tagline, all linking to Home
- The mark (design option 2a, toolbox with a terminal prompt) lives in three places — keep them in sync: `AppIcon.tsx`, `src/app/icon.svg`, `src/app/apple-icon.tsx`
- Tree structure with expand/collapse animation via `max-height` + `opacity` transitions; items 44px, tools indented to 42px, active item = elevated fill + accent text
- Icons per category: `ArrowsLeftRightIcon` (Base64), `PaletteIcon` (Color), `ImageSquareIcon` (Image), `BracketsCurlyIcon` (JSON), `MarkdownLogoIcon` (Markdown), `HashStraightIcon` (Number), `QrCodeIcon` (QR Code), `ShieldCheckIcon` (Security), `TextAaIcon` (Text), `ClockIcon` (Time), `LinkSimpleIcon` (URL), `FingerprintSimpleIcon` (UUID)
- Version from `package.json` via dynamic import
- Footer: version + creator link

### Ordering
- **Categories** in sidebar and home page are sorted alphabetically (Base64, Color, Image, JSON, Markdown, Number, QR Code, Security, Text, Time, URL, UUID)
- **Items within a category** follow logical/usage order (e.g., Generator before Validator)

### Mode-switched pages
- Pages with 2 modes (encode/decode, JSON→CSV/CSV→JSON, etc.) **must preserve input across mode switches**
- Use **separate state variables** per mode (e.g., `jsonInput` + `csvInput`), not a shared `input`
- The `currentInput` is derived from `mode` and the corresponding state

### Common pitfalls
- **Hydration errors**: `crypto.getRandomValues()`, `Date.now()`, `Math.random()` in initial state produce different values on server vs client. Use `useEffect` + `suppressHydrationWarning`, or lazy initializer `useState(() => fn())`
- **Turbopack cache corruption**: If the dev server shows "Persisting failed" or "Compaction failed", run `rm -rf .next && npm run dev`
- **HTML escape pipeline**: When building markdown/HTML parsers, generate HTML BEFORE the final `escapeHTML()` call, or use a placeholder-protection system. Never escape HTML tags that you just created.
- **Markdown renderer classes**: `renderMarkdown` emits token classes as strings; the empty-paragraph cleanup regex matches the exact `<p class="...">` string — update both together.
- **Canvas-based tools**: Use `URL.createObjectURL(file)` immediately after getting the File reference. Don't rely on React state for the file object in canvas operations — state updates are batched and may not have propagated yet.