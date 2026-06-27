export interface RGB {
  r: number; g: number; b: number;
}

export interface HSL {
  h: number; s: number; l: number;
}

export interface ParsedColor {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  r: number; g: number; b: number;
  h: number; s: number; l: number;
  a: number;
}

const CSS_COLORS: Record<string, string> = {
  red: "#FF0000", blue: "#0000FF", green: "#008000", white: "#FFFFFF",
  black: "#000000", gray: "#808080", grey: "#808080", yellow: "#FFFF00",
  orange: "#FFA500", purple: "#800080", pink: "#FFC0CB", cyan: "#00FFFF",
  magenta: "#FF00FF", lime: "#00FF00", teal: "#008080", navy: "#000080",
  maroon: "#800000", olive: "#808000", silver: "#C0C0C0", aqua: "#00FFFF",
  fuchsia: "#FF00FF", brown: "#A52A2A", coral: "#FF7F50", gold: "#FFD700",
  indigo: "#4B0082", ivory: "#FFFFF0", lavender: "#E6E6FA", salmon: "#FA8072",
  tomato: "#FF6347", turquoise: "#40E0D0", violet: "#EE82EE",
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: clamp(h, 0, 360),
    s: clamp(Math.round(s * 100), 0, 100),
    l: clamp(Math.round(l * 100), 0, 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;

  if (sat === 0) {
    const v = Math.round(light * 255);
    return { r: v, g: v, b: v };
  }

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;

  const hueToRgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return {
    r: Math.round(hueToRgb(hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(hue) * 255),
    b: Math.round(hueToRgb(hue - 1 / 3) * 255),
  };
}

function parseHex(input: string): ParsedColor | null {
  let hex = input.replace("#", "").toUpperCase();
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (!/^[0-9A-F]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return buildColor(r, g, b, 1);
}

function parseRgb(input: string): ParsedColor | null {
  const m = input.match(/rgba?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*(?:[,\/]\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  return buildColor(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[4] ? parseFloat(m[4]) : 1);
}

function parseHsl(input: string): ParsedColor | null {
  const m = input.match(/hsla?\(\s*(\d+)\s*[,\s]\s*(\d+)%\s*[,\s]\s*(\d+)%\s*(?:[,\/]\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  const rgb = hslToRgb(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
  return buildColor(rgb.r, rgb.g, rgb.b, m[4] ? parseFloat(m[4]) : 1);
}

function buildColor(r: number, g: number, b: number, a: number): ParsedColor {
  const hsl = rgbToHsl(r, g, b);
  return {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
    h: hsl.h,
    s: hsl.s,
    l: hsl.l,
    a: clamp(a, 0, 1),
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(b, 0, 255)})`,
    rgba: a < 1 ? `rgba(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(b, 0, 255)}, ${a})` : "",
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
}

export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("#") || /^[0-9A-Fa-f]{3,6}$/.test(trimmed)) return parseHex(trimmed);
  if (trimmed.startsWith("rgb")) return parseRgb(trimmed);
  if (trimmed.startsWith("hsl")) return parseHsl(trimmed);
  if (CSS_COLORS[trimmed.toLowerCase()]) return parseHex(CSS_COLORS[trimmed.toLowerCase()]);

  return null;
}

// ---- Palette Generator ----

export type Harmony = "complementary" | "analogous" | "triadic" | "tetradic" | "monochromatic";

export function generatePalette(base: HSL, harmony: Harmony): HSL[] {
  switch (harmony) {
    case "complementary":
      return [base, { h: (base.h + 180) % 360, s: base.s, l: base.l }];
    case "analogous":
      return [
        { h: (base.h - 30 + 360) % 360, s: base.s, l: base.l },
        base,
        { h: (base.h + 30) % 360, s: base.s, l: base.l },
      ];
    case "triadic":
      return [
        base,
        { h: (base.h + 120) % 360, s: base.s, l: base.l },
        { h: (base.h + 240) % 360, s: base.s, l: base.l },
      ];
    case "tetradic":
      return [
        base,
        { h: (base.h + 90) % 360, s: base.s, l: base.l },
        { h: (base.h + 180) % 360, s: base.s, l: base.l },
        { h: (base.h + 270) % 360, s: base.s, l: base.l },
      ];
    case "monochromatic": {
      const result: HSL[] = [];
      for (let i = 0; i < 5; i++) {
        result.push({ h: base.h, s: clamp(base.s - i * 10, 0, 100), l: clamp(base.l + i * 8 - 16, 0, 100) });
      }
      return result;
    }
  }
}

// ---- Contrast Checker (WCAG 2.0) ----

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}
