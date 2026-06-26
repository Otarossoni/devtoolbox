function splitWords(text: string): string[] {
  const d = text
    .replace(/[-_.\s]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
  return d.split(" ").filter(Boolean);
}

export function toTitleCase(text: string): string {
  return splitWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function toCamelCase(text: string): string {
  const words = splitWords(text);
  if (words.length === 0) return "";
  return words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

export function toPascalCase(text: string): string {
  return splitWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function toSnakeCase(text: string): string {
  return splitWords(text).join("_");
}

export function toKebabCase(text: string): string {
  return splitWords(text).join("-");
}

export function toConstantCase(text: string): string {
  return splitWords(text).map((w) => w.toUpperCase()).join("_");
}

export type CaseStyle =
  | "lowercase"
  | "uppercase"
  | "title"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

export function convertCase(input: string, style: CaseStyle): string {
  if (!input.trim()) return "";
  switch (style) {
    case "lowercase":
      return input.toLowerCase();
    case "uppercase":
      return input.toUpperCase();
    case "title":
      return toTitleCase(input);
    case "camel":
      return toCamelCase(input);
    case "pascal":
      return toPascalCase(input);
    case "snake":
      return toSnakeCase(input);
    case "kebab":
      return toKebabCase(input);
    case "constant":
      return toConstantCase(input);
  }
}

export type DiffLine = {
  type: "same" | "add" | "remove";
  leftLine?: number;
  rightLine?: number;
  text: string;
};

export function computeDiff(original: string, modified: string): DiffLine[] {
  const left = original.split("\n");
  const right = modified.split("\n");
  const n = left.length;
  const m = right.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      result.unshift({ type: "same", leftLine: i, rightLine: j, text: left[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "add", rightLine: j, text: right[j - 1] });
      j--;
    } else {
      result.unshift({ type: "remove", leftLine: i, text: left[i - 1] });
      i--;
    }
  }

  return result;
}
