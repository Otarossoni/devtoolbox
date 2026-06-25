export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(binary);
}

export function decodeBase64(input: string): string {
  const sanitized = input.replace(/\s/g, "");
  const binary = atob(sanitized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function isValidBase64(input: string): boolean {
  const sanitized = input.replace(/\s/g, "");
  if (sanitized.length === 0) return false;
  if (sanitized.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(sanitized)) return false;
  try {
    decodeBase64(sanitized);
    return true;
  } catch {
    return false;
  }
}
