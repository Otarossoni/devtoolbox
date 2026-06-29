export function bigIntToRadix(value: bigint, radix: number): string {
  if (radix === 10) return value.toString();
  if (radix === 16) return value.toString(16).toUpperCase();
  if (radix === 2) return value.toString(2);
  if (radix === 8) return value.toString(8);
  return value.toString(radix).toUpperCase();
}

export function parseWithBigInt(input: string, radix: number): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let negative = false;
  let text = trimmed;
  if (text.startsWith("-")) { negative = true; text = text.slice(1); }
  if (text.startsWith("0x")) { text = text.slice(2); radix = 16; }
  else if (text.startsWith("0o")) { text = text.slice(2); radix = 8; }
  else if (text.startsWith("0b")) { text = text.slice(2); radix = 2; }

  if (!text) return null;

  const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, radix);
  const re = new RegExp(`^[${validChars}]+$`, "i");
  if (!re.test(text)) return null;

  let result = 0n;
  const base = BigInt(radix);
  for (const ch of text.toUpperCase()) {
    const digit = validChars.indexOf(ch);
    result = result * base + BigInt(digit);
  }
  return negative ? -result : result;
}

export type BitwiseOp = "AND" | "OR" | "XOR" | "NOT" | "LSHIFT" | "RSHIFT";

export function bitwiseCalc(a: bigint, b: bigint, op: BitwiseOp): bigint {
  switch (op) {
    case "AND": return a & b;
    case "OR": return a | b;
    case "XOR": return a ^ b;
    case "NOT": return ~a;
    case "LSHIFT": return a << b;
    case "RSHIFT": return a >> b;
  }
}

export function bigIntToBitString(value: bigint, bits: number = 32): string {
  let s = "";
  const v = value < 0n ? (1n << BigInt(bits)) + value : value;
  for (let i = bits - 1; i >= 0; i--) {
    s += (v & (1n << BigInt(i))) ? "1" : "0";
  }
  return s;
}

export function formatBinary(bits: string, groupSize: number = 4): string {
  const parts: string[] = [];
  for (let i = 0; i < bits.length; i += groupSize) {
    parts.push(bits.slice(i, i + groupSize));
  }
  return parts.join(" ");
}
