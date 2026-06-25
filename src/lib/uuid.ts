function randomBytes(count: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(count));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function formatUUID(bytes: Uint8Array): string {
  const hex = bytesToHex(bytes);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

// ---- MD5 (rfc1321) ----

function md5(message: Uint8Array): Uint8Array {
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

function sha1(message: Uint8Array): Uint8Array {
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

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

// ---- Namespace UUIDs ----

export const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
export const NAMESPACE_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
export const NAMESPACE_OID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
export const NAMESPACE_X500 = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";

function uuidToBytes(uuid: string): Uint8Array {
  return hexToBytes(uuid.replace(/-/g, ""));
}

function makeV3orV5(
  namespace: string,
  name: string,
  hashFn: (data: Uint8Array) => Uint8Array,
  version: number,
): string {
  const nsBytes = uuidToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const combined = new Uint8Array(nsBytes.length + nameBytes.length);
  combined.set(nsBytes);
  combined.set(nameBytes, nsBytes.length);

  const hash = hashFn(combined);
  const bytes = hash.slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | ((version & 0x0f) << 4);
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUUID(bytes);
}

// ---- Generators ----

export function generateUUIDv4(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUUID(bytes);
}

export function generateUUIDv1(): string {
  const bytes = randomBytes(16);

  const now = Date.now();
  const gregorianOffset = 122192928000000000;
  const timestamp = now * 10000 + gregorianOffset;

  const low = timestamp % 0x100000000;
  const high = Math.floor(timestamp / 0x100000000);

  bytes[0] = low & 0xff;
  bytes[1] = (low >>> 8) & 0xff;
  bytes[2] = (low >>> 16) & 0xff;
  bytes[3] = (low >>> 24) & 0xff;
  bytes[4] = high & 0xff;
  bytes[5] = (high >>> 8) & 0xff;
  bytes[6] = ((high >>> 16) & 0x0f) | 0x10;
  bytes[7] = (high >>> 24) & 0xff;

  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUUID(bytes);
}

export function generateUUIDv7(): string {
  const bytes = randomBytes(16);

  const now = Date.now();
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUUID(bytes);
}

export function generateUUIDv6(): string {
  const bytes = randomBytes(16);

  const now = Date.now();
  const gregorianOffset = 122192928000000000;
  const timestamp = now * 10000 + gregorianOffset;

  const timeHigh = Math.floor(timestamp / 0x10000000);
  const timeMid = Math.floor(timestamp / 0x1000) & 0xffff;
  const timeLow = timestamp & 0xfff;

  bytes[0] = (timeHigh >>> 24) & 0xff;
  bytes[1] = (timeHigh >>> 16) & 0xff;
  bytes[2] = (timeHigh >>> 8) & 0xff;
  bytes[3] = timeHigh & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = 0x60 | ((timeLow >>> 8) & 0x0f);
  bytes[7] = timeLow & 0xff;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUUID(bytes);
}

export function generateUUIDv3(namespace: string, name: string): string {
  return makeV3orV5(namespace, name, md5, 3);
}

export function generateUUIDv5(namespace: string, name: string): string {
  return makeV3orV5(namespace, name, sha1, 5);
}

export type UUIDVersion = "v1" | "v3" | "v4" | "v5" | "v6" | "v7";

export function generateUUID(version: UUIDVersion): string {
  switch (version) {
    case "v1":
      return generateUUIDv1();
    case "v4":
      return generateUUIDv4();
    case "v6":
      return generateUUIDv6();
    case "v7":
      return generateUUIDv7();
    default:
      throw new Error(`Versão ${version} requer parâmetros adicionais. Use generateUUIDv3/v5 diretamente.`);
  }
}

export function isValidUUID(uuid: string): boolean {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export function detectUUIDVersion(uuid: string): UUIDVersion | null {
  if (!isValidUUID(uuid)) return null;
  const versionNibble = uuid.charAt(14);
  switch (versionNibble) {
    case "1": return "v1";
    case "3": return "v3";
    case "4": return "v4";
    case "5": return "v5";
    case "6": return "v6";
    case "7": return "v7";
    default: return null;
  }
}
