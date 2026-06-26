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

// ---- JSON ↔ XML ----

function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function valueToXML(value: unknown, tag: string, indent: number, depth: number): string {
  const pad = " ".repeat(depth * indent);

  if (value === null || value === undefined) {
    return `${pad}<${tag} />`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}<${tag}></${tag}>`;
    return value.map((v) => valueToXML(v, tag, indent, depth)).join("\n");
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const attrs: string[] = [];
    const children: string[] = [];
    const textParts: string[] = [];

    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("@")) {
        attrs.push(`${k.slice(1)}="${escapeXML(String(v))}"`);
      } else if (k === "#text") {
        textParts.push(String(v));
      } else {
        children.push(valueToXML(v, k, indent, depth + 1));
      }
    }

    const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

    if (children.length === 0 && textParts.length === 0) {
      return `${pad}<${tag}${attrStr}>${textParts.join("")}</${tag}>`;
    }

    if (children.length === 0) {
      return `${pad}<${tag}${attrStr}>${escapeXML(textParts.join(""))}</${tag}>`;
    }

    return [
      `${pad}<${tag}${attrStr}>`,
      ...children,
      ...textParts.map((t) => pad + "  " + escapeXML(t)),
      `${pad}</${tag}>`,
    ].join("\n");
  }

  if (typeof value === "string") {
    return `${pad}<${tag}>${escapeXML(value)}</${tag}>`;
  }

  return `${pad}<${tag}>${value}</${tag}>`;
}

export function jsonToXML(input: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== "object" || parsed === null) {
      return { result: "", error: "JSON root must be an object or array" };
    }

    let xml: string;
    if (Array.isArray(parsed)) {
      const items = parsed.map((v) => valueToXML(v, "item", 2, 1)).join("\n");
      xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${items}\n</root>\n`;
    } else {
      const obj = Object.keys(parsed).length !== 1 ? { root: parsed } : parsed;
      const rootTag = Object.keys(obj)[0];
      xml = `<?xml version="1.0" encoding="UTF-8"?>\n${valueToXML(obj[rootTag], rootTag, 2, 0)}\n`;
    }

    return { result: xml, error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export function xmlToJSON(input: string): { result: string; error: string | null } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "text/xml");
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
      return { result: "", error: errorNode.textContent || "XML parsing error" };
    }
    const json = elementToJSON(doc.documentElement!);
    return { result: JSON.stringify({ [nodeName(doc.documentElement!)]: json }, null, 2), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function nodeName(el: Element): string {
  return el.tagName;
}

function elementToJSON(el: Element): unknown {
  const result: Record<string, unknown> = {};
  const childElements: Element[] = Array.from(el.children);

  for (const attr of Array.from(el.attributes)) {
    result[`@${attr.name}`] = attr.value;
  }

  const textChildren = Array.from(el.childNodes).filter(
    (n) => n.nodeType === 3 && n.textContent!.trim(),
  );

  if (childElements.length === 0) {
    const text = el.textContent?.trim() || "";
    if (Object.keys(result).length > 0) {
      result["#text"] = text;
      return result;
    }
    return text;
  }

  const groups = new Map<string, unknown[]>();
  for (const child of childElements) {
    const name = nodeName(child);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(elementToJSON(child));
  }

  for (const textChild of textChildren) {
    const existing = result["#text"] as string;
    result["#text"] = existing ? existing + " " + textChild.textContent!.trim() : textChild.textContent!.trim();
  }

  for (const [name, vals] of groups) {
    result[name] = vals.length === 1 ? vals[0] : vals;
  }

  return result;
}

// ---- JSON ↔ Query String ----

function flattenForQS(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && v !== undefined && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(result, flattenForQS(v as Record<string, unknown>, key));
    } else if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "object" && item !== null) {
          Object.assign(result, flattenForQS(item as Record<string, unknown>, `${key}[]`));
        } else {
          result[`${key}[]`] = String(item);
        }
      }
    } else {
      result[key] = v === null || v === undefined ? "" : String(v);
    }
  }
  return result;
}

export function jsonToQueryString(input: string): { result: string; error: string | null } {
  try {
    const obj = JSON.parse(input);
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return { result: "", error: "JSON root must be a flat or nested object" };
    }
    const flat = flattenForQS(obj);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(flat)) {
      params.append(k, v);
    }
    return { result: params.toString(), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function unflattenQS(params: URLSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of params.entries()) {
    const keys = k.split(/\[|\]\[?/).filter(Boolean);
    let current: Record<string, unknown> = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      const existing = current[lastKey];
      current[lastKey] = Array.isArray(existing) ? [...existing, v] : [existing, v];
    } else {
      current[lastKey] = v;
    }
  }
  return result;
}

export function queryStringToJSON(input: string): { result: string; error: string | null } {
  try {
    const qs = input.includes("?") ? input.split("?")[1] : input;
    const params = new URLSearchParams(qs.trim());
    const obj = unflattenQS(params);
    return { result: JSON.stringify(obj, null, 2), error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}
