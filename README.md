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

A collection of focused utilities for everyday development tasks. Built with Next.js App Router + Turbopack, TypeScript, and Tailwind CSS.

## Tools

### UUID

**Generator** — Generate UUIDs across six versions: v1 (timestamp + MAC), v3 (MD5 + namespace), v4 (random), v5 (SHA-1 + namespace), v6 (reordered timestamp), and v7 (Unix timestamp). Supports deterministic generation for v3 and v5.

**Validator** — Paste any UUID to instantly check validity and identify its version. Real-time feedback as you type.

## Features

- 🔑 **UUID Generator**: v1, v3, v4, v5, v6, v7 with deterministic support for v3/v5
- 🔍 **UUID Validator**: Real-time version detection and validation

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
