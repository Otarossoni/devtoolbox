# DevToolbox

<div align="center">
  <p>
    <strong>Software development utilities — fast, focused, no distractions.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black.svg?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  </p>
</div>

---

## About

A collection of focused utilities for everyday development tasks. Built with Next.js App Router + Turbopack, TypeScript, Tailwind CSS, and Phosphor Icons. 100% client-side — no data leaves your browser.

## Tools

### Base64

**Text** — Encode and decode text strings to/from Base64 in real time. UTF-8 safe, handles Unicode and emoji.

**Image** — Encode images to Base64 (drag & drop or file picker) and decode Base64 strings back to images with preview and download losslessly.

**PDF** — Encode and decode PDF files with blob-based preview rendering and download.

**File** — Encode any file type to Base64 and decode it back. Auto-detects MIME type from data URIs.

**Validator** — Validate Base64 strings and inspect their structure. Detects invalid characters, padding errors, data URIs, URL-safe encoding, and estimates decoded size. Includes text preview for readable content.

### Color

**Converter** — Convert colors between HEX, RGB, HSL, and CSS named formats. Includes a custom color picker with canvas-based free-hand selection and live preview.

**Palette** — Generate color harmonies (complementary, analogous, triadic, tetradic, monochromatic) from a base color. Swatches show HEX and HSL values.

**Contrast** — Check WCAG 2.0 contrast ratios between foreground and background colors. Shows pass/fail for AA and AAA levels with a live text preview.

### Image

**Converter** — Convert images between PNG, JPEG, WebP, and PDF formats. Adjustable quality slider for lossy formats. Side-by-side original vs converted preview with file sizes.

**Resizer** — Resize images by exact dimensions with aspect ratio lock. Supports PNG, JPEG, and WebP output. All processing via Canvas API — nothing is uploaded.

**Extractor** — Upload an image and click on any pixel to extract its exact color. Returns HEX, RGB, and HSL values. Includes a zoom loupe that follows the cursor for pixel-perfect selection.

### JSON

**Formatter & Validator** — Format JSON with VS Code-style syntax highlighting, validate structure with line-level error messages, minify to compact output, and explore deeply nested objects with an interactive collapsible tree view.

**CSV Converter** — Convert JSON arrays of objects to CSV and vice versa. Properly escapes commas, quotes, and newlines.

**YAML Converter** — Convert between JSON and YAML formats. Ideal for config files, Docker Compose, and Kubernetes manifests.

**XML Converter** — Convert between JSON and XML using the browser's native DOMParser. Supports attributes (`@key`) and mixed text content (`#text`). Arrays are auto-wrapped in `<root><item>...</item></root>`.

**Query String** — Convert flat or nested JSON objects to URL query strings and back. Accepts full URLs (with `?`) or raw query strings. Handles nested keys (`key[sub]`) and arrays (`key[]`).

**Diff** — Compare two JSON objects and find structural differences with a color-coded tree (green added, red removed, amber changed).

**Path** — Extract values from deeply nested JSON using path expressions like `$.store.books[0].title`. Supports key access, array indices, wildcards (`[*]`), and slices (`[0:5]`). Results rendered as an interactive tree.

### Markdown

**Editor** — Write and preview Markdown with live rendering. Supports headings, bold/italic, code blocks, links, images, blockquotes, task lists, and tables. Toggle between Write, Split, and Preview modes. Interactive checkboxes sync back to the source.

**Table Generator** — Create properly formatted Markdown tables with an editable grid. Toggle column alignment (left, center, right). Presets for common sizes (3×3, 4×4, 5×4).

### Number

**Base Converter** — Convert numbers between binary (2), octal (8), decimal (10), and hexadecimal (16). Supports arbitrarily large integers and automatic prefix detection (`0b`, `0o`, `0x`).

**Bitwise Calculator** — Perform bitwise operations (AND, OR, XOR, NOT, left/right shift) on integers with 32-bit nibble visualization.

### Security

**Hash Generator** — Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any input text. Optional HMAC mode with secret key for message authentication.

**Password** — Generate cryptographically secure random passwords. Adjustable length (8–128), character sets, entropy meter, and ambiguous character exclusion.

**JWT Decoder** — Decode JSON Web Tokens into header, payload, and signature parts. Displays expiration status and converts timestamp claims to readable dates.

### Text

**Case Switcher** — Convert text between lowercase, UPPERCASE, Title Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. Auto-detects word boundaries from any input format.

**Char Counter** — Real-time text statistics: characters, words, lines, spaces, sentences, paragraphs, reading time, and UTF-8 byte size. Newlines excluded from character count to match industry convention.

**Diff Checker** — Compare two texts line by line using the Longest Common Subsequence (LCS) algorithm. Color-coded output with line numbers.

**Lorem Ipsum** — Generate placeholder text in paragraphs, sentences, or words. 32-sentence corpus for variety.

**Replacer** — Find and replace text with plain string matching or regex. Supports global, case-insensitive, multiline, and dotall flags. Shows replacement count.

### Time

**Timestamp Converter** — Convert between Unix timestamps (seconds/milliseconds), ISO 8601, UTC, local time, and relative time. Auto-detects input format. Live clock with current Unix timestamp.

**Date Calculator** — Add or subtract days, weeks, months, years (and more) from any date. Calculate exact differences between two dates broken down as years, months, days, hours, minutes, and seconds.

### URL

**Encoder/Decoder** — Encode and decode URL components with `encodeURIComponent` (full) or `encodeURI` (URL-safe) modes. Preserves or encodes special characters as needed.

**Parser** — Decompose any URL into its structural parts: protocol, host, port, path, query string, and hash. Edit query parameters live and reconstruct the URL.

### UUID

**Generator** — Generate UUIDs across six versions: v1 (timestamp + MAC), v3 (MD5 + namespace), v4 (random), v5 (SHA-1 + namespace), v6 (reordered timestamp), and v7 (Unix timestamp). Supports deterministic generation for v3 and v5 with namespace selection and custom name input.

**Bulk Generator** — Generate up to 1,000 UUIDs at once. Export as .txt (one per line) or .json (array). Ideal for test fixtures and database seeds.

**Validator** — Paste any UUID to instantly check validity and identify its version. Real-time feedback as you type.

**Inspector** — Decode a UUID's internal structure: version, variant, embedded timestamp (for v1/v6/v7), clock sequence, MAC address, nil UUID detection, and raw bytes. Color-coded field breakdown.

## Stack

| Category      | Technology              |
| ------------- | ----------------------- |
| **Framework** | Next.js 16 (App Router) |
| **Language**  | TypeScript              |
| **Styling**   | Tailwind CSS 4          |
| **Icons**     | Phosphor Icons          |
| **Font**      | Geist (Google Fonts)    |

## Getting Started

### Prerequisites

- Node.js 20.x+

### Installation

```bash
# Clone
git clone https://github.com/Otarossoni/devtoolbox.git

# Enter the directory
cd devtoolbox

# Install dependencies
npm install

# Start the development server
npm run dev
```

Access [http://localhost:3000](http://localhost:3000).

## Commands

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Development server with Turbopack |
| `npm run build`     | Production build                  |
| `npm start`         | Production server                 |
| `npm run lint`      | Code linting                      |
| `npm run typecheck` | TypeScript type checking          |
