export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(binary);
}

export function decodeBase64(input: string): string {
  const sanitized = input.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(sanitized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function isValidBase64(input: string): boolean {
  const sanitized = input.replace(/\s/g, "");
  if (sanitized.length === 0) return false;
  if (sanitized.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+\/\-_]*={0,2}$/.test(sanitized)) return false;
  try {
    decodeBase64(sanitized);
    return true;
  } catch {
    return false;
  }
}

export type Base64Validation = {
  valid: boolean;
  errors: string[];
  isDataURI: boolean;
  mime: string | null;
  decodedSize: number;
  isURLSafe: boolean;
  chars: number;
  padding: "correct" | "missing" | "excess" | "none";
};

export function validateBase64(input: string): Base64Validation {
  const trimmed = input.trim();
  const errors: string[] = [];

  const dataUriMatch = trimmed.match(/^data:([^;]*);?/);
  const isDataURI = !!dataUriMatch;
  const mime = dataUriMatch ? dataUriMatch[1] : null;

  const base64Part = isDataURI ? trimmed.split(",")[1] || "" : trimmed;
  const sanitized = base64Part.replace(/\s/g, "");

  const padded = sanitized.replace(/=/g, "");
  let padding: Base64Validation["padding"] = "none";

  if (!/^[A-Za-z0-9+\/\-_]*$/.test(padded)) {
    errors.push("Invalid character found — only A-Z, a-z, 0-9, +, /, -, _, and = are allowed");
  }

  if (sanitized.length === 0) {
    errors.push("Empty input");
  } else if (sanitized.length % 4 !== 0) {
    padding = "missing";
    errors.push("Invalid length — not a multiple of 4");
  } else {
    const paddingCount = sanitized.length - padded.length;
    if (paddingCount > 2) {
      padding = "excess";
      errors.push("Too many padding characters");
    } else {
      padding = paddingCount > 0 ? "correct" : "none";
    }
  }

  const isURLSafe = /^[A-Za-z0-9\-_]*={0,2}$/.test(sanitized) && !/\+|\//.test(sanitized);

  const chars = base64Part.length;
  const decodedSize = Math.round((chars * 3) / 4);

  if (errors.length === 0) {
    try {
      decodeBase64(sanitized);
    } catch {
      errors.push("Decoding failed — corrupted data");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    isDataURI,
    mime,
    decodedSize,
    isURLSafe,
    chars,
    padding: errors.length > 0 ? padding : (padding === "none" || padding === "correct" ? padding : "missing"),
  };
}

export function getBase64Preview(
  input: string,
  maxLen: number = 200,
): { text: string; isBinary: boolean } | null {
  const sanitized = input.replace(/\s/g, "");
  try {
    const text = decodeBase64(sanitized);
    const slice = text.slice(0, maxLen);
    const isBinary = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(slice);
    return { text: slice, isBinary };
  } catch {
    return null;
  }
}
