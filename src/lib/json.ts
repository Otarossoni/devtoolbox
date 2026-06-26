export type JSONNode = {
  key: string | null;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  value: string;
  children: JSONNode[];
  size: number;
};

export function formatJSON(input: string): { result: string; error: string | null } {
  try {
    const obj = JSON.parse(input);
    return { result: JSON.stringify(obj, null, 2), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export function minifyJSON(input: string): { result: string; error: string | null } {
  try {
    const obj = JSON.parse(input);
    return { result: JSON.stringify(obj), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlightJSON(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)/g,
    (_match, key, str, num, bool, nil) => {
      if (key) return `<span class="text-[#9CDCFE]">${escapeHTML(key)}</span>:`;
      if (str) return `<span class="text-[#CE9178]">${escapeHTML(str)}</span>`;
      if (num) return `<span class="text-[#B5CEA8]">${num}</span>`;
      if (bool) return `<span class="text-[#569CD6]">${bool}</span>`;
      if (nil) return `<span class="text-[#808080]">${nil}</span>`;
      return _match;
    },
  );
}

export function buildJSONTree(value: unknown, key: string | null = null): JSONNode {
  if (value === null) {
    return { key, type: "null", value: "null", children: [], size: 1 };
  }
  if (Array.isArray(value)) {
    const children = value.map((v, i) => buildJSONTree(v, String(i)));
    return { key, type: "array", value: `[${value.length}]`, children, size: value.length };
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const children = entries.map(([k, v]) => buildJSONTree(v, k));
    return { key, type: "object", value: `{${entries.length}}`, children, size: entries.length };
  }
  if (typeof value === "string") {
    return { key, type: "string", value: JSON.stringify(value), children: [], size: 1 };
  }
  if (typeof value === "number") {
    return { key, type: "number", value: String(value), children: [], size: 1 };
  }
  if (typeof value === "boolean") {
    return { key, type: "boolean", value: String(value), children: [], size: 1 };
  }
  return { key, type: "null", value: "null", children: [], size: 1 };
}

export function jsonToCSV(input: string): { result: string; error: string | null } {
  try {
    const arr = JSON.parse(input);
    if (!Array.isArray(arr) || arr.length === 0 || typeof arr[0] !== "object" || arr[0] === null) {
      return { result: "", error: "Input must be a non-empty array of objects" };
    }
    const headers = Object.keys(arr[0]);
    const lines = [headers.join(",")];
    for (const row of arr) {
      const values = headers.map((h) => {
        const val = (row as Record<string, unknown>)[h];
        if (val === null || val === undefined) return "";
        const s = String(val);
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      });
      lines.push(values.join(","));
    }
    return { result: lines.join("\n"), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export function csvToJSON(input: string): { result: string; error: string | null } {
  try {
    const lines = input.trim().split("\n");
    if (lines.length < 2) {
      return { result: "", error: "CSV must have at least a header row and one data row" };
    }
    const headers = parseCSVLine(lines[0]);
    const result: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const obj: Record<string, string> = {};
      headers.forEach((h, j) => {
        obj[h] = j < values.length ? values[j] : "";
      });
      result.push(obj);
    }
    return { result: JSON.stringify(result, null, 2), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ---- JSON Diff ----

export type DiffType = "same" | "added" | "removed" | "changed";

export interface DiffNode {
  key: string | null;
  type: DiffType;
  oldValue?: string;
  newValue?: string;
  children: DiffNode[];
}

export function diffJSON(original: unknown, modified: unknown, key: string | null = null): DiffNode {
  if (original === null && modified === null) {
    return { key, type: "same", children: [], oldValue: "null", newValue: "null" };
  }
  if (original === null) {
    return { key, type: "added", children: [], newValue: formatValue(modified) };
  }
  if (modified === null) {
    return { key, type: "removed", children: [], oldValue: formatValue(original) };
  }

  const typeA = Array.isArray(original) ? "array" : typeof original;
  const typeB = Array.isArray(modified) ? "array" : typeof modified;

  if (typeA !== typeB) {
    return { key, type: "changed", oldValue: formatValue(original), newValue: formatValue(modified), children: [] };
  }

  if (typeof original !== "object" || original === null) {
    if (String(original) === String(modified)) {
      return { key, type: "same", children: [], oldValue: formatValue(original) };
    }
    return { key, type: "changed", oldValue: formatValue(original), newValue: formatValue(modified), children: [] };
  }

  if (Array.isArray(original) && Array.isArray(modified)) {
    const maxLen = Math.max(original.length, modified.length);
    const children: DiffNode[] = [];
    for (let i = 0; i < maxLen; i++) {
      children.push(diffJSON(original[i], modified[i], String(i)));
    }
    return { key, type: children.every((c) => c.type === "same") ? "same" : "changed", children };
  }

  const objA = original as Record<string, unknown>;
  const objB = modified as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
  const children: DiffNode[] = [];

  for (const k of allKeys) {
    if (!(k in objA)) {
      children.push({ key: k, type: "added", children: [], newValue: formatValue(objB[k]) });
    } else if (!(k in objB)) {
      children.push({ key: k, type: "removed", children: [], oldValue: formatValue(objA[k]) });
    } else {
      children.push(diffJSON(objA[k], objB[k], k));
    }
  }

  return { key, type: children.length === 0 ? "same" : children.every((c) => c.type === "same") ? "same" : "changed", children };
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.length}]`;
  if (typeof value === "object") return `{${Object.keys(value as object).length}}`;
  return JSON.stringify(value);
}

// ---- JSON Path ----

export function evaluateJSONPath(obj: unknown, path: string): { value: unknown; error: string | null } {
  try {
    const clean = path.replace(/^\$/, "").replace(/^\./, "");
    const segments = parsePathSegments(clean);
    let current = obj;
    for (const seg of segments) {
      current = resolveSegment(current, seg);
    }
    return { value: current, error: null };
  } catch (e) {
    return { value: null, error: (e as Error).message };
  }
}

type PathSegment = { type: "key"; key: string } | { type: "index"; indices: number[] } | { type: "wildcard" };

function parsePathSegments(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === ".") { i++; continue; }
    if (path[i] === "[") {
      const end = path.indexOf("]", i);
      if (end === -1) throw new Error("Unclosed bracket");
      const content = path.slice(i + 1, end);
      if (content === "*") {
        segments.push({ type: "wildcard" });
      } else if (content.includes(":")) {
        const [start, end_] = content.split(":").map(Number);
        segments.push({ type: "index", indices: range(start, end_ || undefined) });
      } else {
        segments.push({ type: "index", indices: content.split(",").map(Number) });
      }
      i = end + 1;
    } else {
      let j = i;
      while (j < path.length && path[j] !== "." && path[j] !== "[") j++;
      segments.push({ type: "key", key: path.slice(i, j) });
      i = j;
    }
  }
  return segments;
}

function range(start: number, end?: number): number[] {
  if (end === undefined) return [start];
  return Array.from({ length: end - start }, (_, i) => start + i);
}

function resolveSegment(current: unknown, seg: PathSegment): unknown {
  if (seg.type === "key") {
    const obj = current as Record<string, unknown>;
    if (!(seg.key in obj)) throw new Error(`Key "${seg.key}" not found`);
    return obj[seg.key];
  }
  if (seg.type === "index") {
    const arr = current as unknown[];
    if (!Array.isArray(arr)) throw new Error("Cannot index non-array");
    if (seg.indices.length === 1) {
      const idx = seg.indices[0];
      if (idx < 0 || idx >= arr.length) throw new Error(`Index ${idx} out of bounds`);
      return arr[idx];
    }
    return seg.indices.filter((idx) => idx >= 0 && idx < arr.length).map((idx) => arr[idx]);
  }
  if (seg.type === "wildcard") {
    if (!Array.isArray(current)) throw new Error("Wildcard requires array");
    return current;
  }
  throw new Error("Invalid segment");
}
