import { md5, sha1, bytesToHex } from "@/lib/hash";

function randomBytes(count: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(count));
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

// ---- Inspector utilities ----

export type UUIDVariant = "RFC 4122" | "Microsoft" | "NCS" | "Future";

export function getUUIDVariant(uuid: string): UUIDVariant | null {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) return null;
  const b8 = parseInt(hex.slice(16, 18), 16);
  if ((b8 & 0x80) === 0) return "NCS";
  if ((b8 & 0xC0) === 0x80) return "RFC 4122";
  if ((b8 & 0xE0) === 0xC0) return "Microsoft";
  return "Future";
}

const GREGORIAN_OFFSET = 122192928000000000n;

export function extractUUIDTimestamp(
  uuid: string,
  version: UUIDVersion,
): { ts: number; date: Date } | null {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) return null;

  let timestampNs: bigint;

  if (version === "v1") {
    const timeLow = BigInt(parseInt(hex.slice(0, 8), 16));
    const timeMid = BigInt(parseInt(hex.slice(8, 12), 16));
    const timeHi = BigInt(parseInt(hex.slice(12, 16), 16) & 0x0fff);
    timestampNs = (timeHi << 48n) | (timeMid << 32n) | timeLow;
  } else if (version === "v6") {
    const timeHigh = BigInt(parseInt(hex.slice(0, 8), 16));
    const timeMid = BigInt(parseInt(hex.slice(8, 12), 16));
    const timeLow = BigInt(parseInt(hex.slice(12, 16), 16) & 0x0fff);
    timestampNs = (timeHigh << 28n) | (timeMid << 12n) | timeLow;
  } else if (version === "v7") {
    const ms = parseInt(hex.slice(0, 12), 16);
    return { ts: ms, date: new Date(ms) };
  } else {
    return null;
  }

  const unixMs = Number((timestampNs - GREGORIAN_OFFSET) / 10000n);
  return { ts: unixMs, date: new Date(unixMs) };
}

export function extractUUIDNode(uuid: string): string | null {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) return null;
  const node = hex.slice(20, 32);
  return [
    node.slice(0, 2),
    node.slice(2, 4),
    node.slice(4, 6),
    node.slice(6, 8),
    node.slice(8, 10),
    node.slice(10, 12),
  ]
    .join(":")
    .toUpperCase();
}

export function extractUUIDClockSeq(uuid: string): number | null {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) return null;
  const b8 = parseInt(hex.slice(16, 18), 16);
  const b9 = parseInt(hex.slice(18, 20), 16);
  return ((b8 & 0x3f) << 8) | b9;
}

export function isNilUUID(uuid: string): boolean {
  return uuid.replace(/-/g, "") === "00000000000000000000000000000000";
}

export function uuidToHexBytes(uuid: string): string {
  return uuid
    .replace(/-/g, "")
    .toUpperCase()
    .match(/.{2}/g)!
    .join(" ");
}
