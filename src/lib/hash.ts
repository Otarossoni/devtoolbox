// ---- MD5 (rfc1321) ----

export function md5(message: Uint8Array): Uint8Array {
  const T: number[] = [];
  for (let i = 1; i <= 64; i++) {
    T[i - 1] = (Math.floor(Math.abs(Math.sin(i)) * 4294967296)) >>> 0;
  }

  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function rotl(x: number, n: number) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const msgLen = message.length;
  const paddedLen = (((msgLen + 8) >>> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(message);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, msgLen * 8, true);

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < paddedLen; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let j = 0; j < 64; j++) {
      let f: number, g: number;
      if (j < 16) { f = F(B, C, D); g = j; }
      else if (j < 32) { f = G(B, C, D); g = (5 * j + 1) % 16; }
      else if (j < 48) { f = H(B, C, D); g = (3 * j + 5) % 16; }
      else { f = I(B, C, D); g = (7 * j) % 16; }

      const temp = D;
      D = C;
      C = B;
      B = (B + rotl(A + f + T[j] + M[g], S[j])) >>> 0;
      A = temp;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const result = new Uint8Array(16);
  const rv = new DataView(result.buffer);
  rv.setUint32(0, a0, true);
  rv.setUint32(4, b0, true);
  rv.setUint32(8, c0, true);
  rv.setUint32(12, d0, true);
  return result;
}

// ---- SHA-1 (rfc3174) ----

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

export function sha1(message: Uint8Array): Uint8Array {
  const msgLen = message.length;
  const paddedLen = (((msgLen + 8) >>> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(message);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 4, msgLen * 8, false);

  let h0 = 0x67452301 >>> 0;
  let h1 = 0xefcdab89 >>> 0;
  let h2 = 0x98badcfe >>> 0;
  let h3 = 0x10325476 >>> 0;
  let h4 = 0xc3d2e1f0 >>> 0;

  for (let offset = 0; offset < paddedLen; offset += 64) {
    const W = new Uint32Array(80);
    for (let j = 0; j < 16; j++) {
      W[j] = view.getUint32(offset + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      W[j] = rotl(W[j - 3] ^ W[j - 8] ^ W[j - 14] ^ W[j - 16], 1);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let j = 0; j < 80; j++) {
      let f: number, k: number;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rotl(a, 5) + f + e + k + W[j]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const rv = new DataView(result.buffer);
  rv.setUint32(0, h0, false);
  rv.setUint32(4, h1, false);
  rv.setUint32(8, h2, false);
  rv.setUint32(12, h3, false);
  rv.setUint32(16, h4, false);
  return result;
}

// ---- Shared utilities ----

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hash));
}

export async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return bytesToHex(new Uint8Array(hash));
}

export async function hashWithHmac(
  input: string,
  key: string,
  algorithm: "SHA-256" | "SHA-512",
): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(input));
  return bytesToHex(new Uint8Array(signature));
}

export function computeHashSync(input: string, algorithm: "md5" | "sha1"): string {
  const data = new TextEncoder().encode(input);
  const hash = algorithm === "md5" ? md5(data) : sha1(data);
  return bytesToHex(hash);
}

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

// ---- Password Generator ----

export function generatePassword(
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean; excludeAmbiguous: boolean },
): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const syms = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const ambiguous = "Il1O0";

  let charset = "";
  if (options.uppercase) charset += upper;
  if (options.lowercase) charset += lower;
  if (options.numbers) charset += nums;
  if (options.symbols) charset += syms;

  if (!charset) return "";

  if (options.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((c) => !ambiguous.includes(c))
      .join("");
  }

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }

  return result;
}

export function passwordEntropy(password: string, options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }): number {
  let poolSize = 0;
  let usedUpper = false, usedLower = false, usedNum = false, usedSym = false;
  const upper = /[A-Z]/, lower = /[a-z]/, num = /[0-9]/, sym = /[^A-Za-z0-9]/;

  if (options.uppercase) { poolSize += 26; if (upper.test(password)) usedUpper = true; }
  if (options.lowercase) { poolSize += 26; if (lower.test(password)) usedLower = true; }
  if (options.numbers) { poolSize += 10; if (num.test(password)) usedNum = true; }
  if (options.symbols) { poolSize += 28; if (sym.test(password)) usedSym = true; }

  const bits = Math.log2(poolSize) * password.length;
  const missing =
    (options.uppercase && !usedUpper) ||
    (options.lowercase && !usedLower) ||
    (options.numbers && !usedNum) ||
    (options.symbols && !usedSym);

  return missing ? Math.max(1, bits / 2) : bits;
}

// ---- JWT Decoder ----

export interface JWTDecoded {
  header: unknown;
  payload: unknown;
  signature: string;
  valid: boolean;
  error?: string;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJWT(token: string): JWTDecoded {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { header: null, payload: null, signature: "", valid: false, error: "Invalid JWT format — expected 3 parts separated by dots" };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload, signature: parts[2], valid: true };
  } catch (e) {
    return { header: null, payload: null, signature: "", valid: false, error: (e as Error).message };
  }
}
