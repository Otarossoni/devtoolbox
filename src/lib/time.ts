export function unixToDate(ts: number, isMs: boolean): Date {
  return new Date(isMs ? ts : ts * 1000);
}

export function dateToUnix(date: Date): { seconds: number; milliseconds: number } {
  const ms = date.getTime();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}

export function formatISO(date: Date): string {
  return date.toISOString();
}

export function formatUTC(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
    hour12: false,
  });
}

export function formatLocal(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    hour12: false,
  });
}

export function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const abs = Math.abs(diff);

  const seconds = Math.floor(abs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const prefix = diff >= 0 ? "" : "in ";

  if (seconds < 60) return prefix + (seconds === 0 ? "just now" : `${seconds}s ago`);
  if (minutes < 60) return prefix + `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return prefix + `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return prefix + `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 5) return prefix + `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12) return prefix + `${months} month${months !== 1 ? "s" : ""} ago`;
  return prefix + `${years} year${years !== 1 ? "s" : ""} ago`;
}

export function detectAndParse(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Unix seconds (10 digits, starts with 1 or 2, after year ~2000)
  if (/^1\d{9}$/.test(trimmed) && parseInt(trimmed) < 9999999999) {
    return new Date(parseInt(trimmed) * 1000);
  }

  // Unix milliseconds (13 digits, starts with 1 or 2)
  if (/^1\d{12}$/.test(trimmed)) {
    return new Date(parseInt(trimmed));
  }

  // ISO 8601
  const isoMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/,
  );
  if (isoMatch) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  // datetime-local: YYYY-MM-DDTHH:MM[SS] without timezone — interpret as local time
  const localMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?$/);
  if (localMatch) {
    const [y, m, d] = localMatch[1].split("-").map(Number);
    const [h, min] = localMatch[2].split(":").map(Number);
    const s = localMatch[3] ? parseInt(localMatch[3]) : 0;
    return new Date(y, m - 1, d, h, min, s);
  }

  // Try native Date parsing for other formats
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  // BR format: dd/mm/yyyy or dd/mm/yyyy hh:mm:ss
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}:\d{2}(?::\d{2})?))?$/);
  if (brMatch) {
    const [, d2, m, y, t] = brMatch;
    const str = `${y}-${m}-${d2}${t ? "T" + t : ""}`;
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

export type TimeUnit = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";

export function addToDate(date: Date, amount: number, unit: TimeUnit): Date {
  const d = new Date(date);
  switch (unit) {
    case "seconds":
      d.setSeconds(d.getSeconds() + amount);
      break;
    case "minutes":
      d.setMinutes(d.getMinutes() + amount);
      break;
    case "hours":
      d.setHours(d.getHours() + amount);
      break;
    case "days":
      d.setDate(d.getDate() + amount);
      break;
    case "weeks":
      d.setDate(d.getDate() + amount * 7);
      break;
    case "months":
      d.setMonth(d.getMonth() + amount);
      break;
    case "years":
      d.setFullYear(d.getFullYear() + amount);
      break;
  }
  return d;
}

export function dateDiff(a: Date, b: Date): {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
} {
  const abs = Math.abs(b.getTime() - a.getTime());
  const totalDays = abs / (1000 * 60 * 60 * 24);

  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  let hours = b.getHours() - a.getHours();
  let minutes = b.getMinutes() - a.getMinutes();
  let seconds = b.getSeconds() - a.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(b.getFullYear(), b.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  return { years, months, days, hours, minutes, seconds, totalDays };
}

export function formatDiff(diff: ReturnType<typeof dateDiff>): string {
  const parts: string[] = [];
  if (diff.years > 0) parts.push(`${diff.years} year${diff.years !== 1 ? "s" : ""}`);
  if (diff.months > 0) parts.push(`${diff.months} month${diff.months !== 1 ? "s" : ""}`);
  if (diff.days > 0) parts.push(`${diff.days} day${diff.days !== 1 ? "s" : ""}`);
  if (diff.hours > 0) parts.push(`${diff.hours} hour${diff.hours !== 1 ? "s" : ""}`);
  if (diff.minutes > 0) parts.push(`${diff.minutes} minute${diff.minutes !== 1 ? "s" : ""}`);
  if (diff.seconds > 0 && parts.length === 0) parts.push(`${diff.seconds} second${diff.seconds !== 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(", ") : "0 seconds";
}
