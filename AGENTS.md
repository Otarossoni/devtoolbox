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
│   ├── layout.tsx        # Root layout (Sidebar + main)
│   ├── page.tsx          # Home page
│   └── tools/
│       ├── uuid/
│       │   ├── generator/page.tsx
│       │   └── validator/page.tsx
│       └── base64/
│           ├── page.tsx        # Text encode/decode
│           └── image/page.tsx  # Image encode/decode
├── components/
│   ├── Sidebar.tsx
│   └── CopyButton.tsx
└── lib/
    ├── uuid.ts            # UUID generation (v1-v7), MD5, SHA-1, validation
    └── base64.ts          # Base64 encode/decode/validate
```

### Component patterns
- All interactive pages are client components (`"use client"`)
- `useState` + `useCallback` for state and handlers
- Random initial values use `useState(() => fn())` with `suppressHydrationWarning`
- Icons imported from `@phosphor-icons/react/dist/ssr`
- Tailwind arbitrary values for custom purple (`#8A2BE2`) and dark theme colors (`#0a0a0a`, `#262626`, `#171717`)

### Styling
- Dark theme only (no light mode)
- Purple accent: `#8A2BE2` for active states, borders, buttons
- Background hierarchy: `#000000` (body) > `#0a0a0a` (cards) > `#171717` (hover)
- Border: `#262626` default, `#8A2BE2` on focus/active
- Text: `#ededed` primary, `neutral-500` secondary, `neutral-600` tertiary
- Font: Geist Sans + Geist Mono

### Sidebar
- Tree structure with expand/collapse animation via `max-h` + `opacity` transitions
- Icons per category: `FingerprintSimpleIcon` (UUID), `ArrowsLeftRightIcon` (Base64)
- Version from `package.json` via dynamic import
- Footer: version + creator link
