import type { CertificateKind } from "@/lib/compliance";

const kindSignals: Array<[CertificateKind, string[]]> = [
  ["Gas safety", ["gas safety record", "gas safe", "cp12"]],
  ["EICR", ["electrical installation condition report", "eicr"]],
  ["EPC", ["energy performance certificate", "energy efficiency rating"]],
  ["Landlord insurance", ["landlord insurance", "policy schedule"]],
  [
    "Property licence",
    ["property licence", "hmo licence", "selective licence"],
  ],
];

const datePattern =
  /\b(?:([0-3]?\d)[/.-]([01]?\d)[/.-]((?:19|20)\d{2})|((?:19|20)\d{2})[/.-]([01]?\d)[/.-]([0-3]?\d))\b/g;

function toIso(match: RegExpExecArray) {
  const year = match[3] ?? match[4];
  const month = match[2] ?? match[5];
  const day = match[1] ?? match[6];
  const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? value : null;
}

export function extractCertificateDetails(text: string) {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  const kind =
    kindSignals.find(([, signals]) =>
      signals.some((signal) => normalized.includes(signal)),
    )?.[0] ?? null;
  const candidates: Array<{ date: string; score: number; context: string }> =
    [];

  for (const match of normalized.matchAll(datePattern)) {
    const date = toIso(match);
    if (!date || match.index === undefined) continue;
    const start = Math.max(0, match.index - 90);
    const end = Math.min(normalized.length, match.index + match[0].length + 40);
    const context = normalized.slice(start, end);
    let score = 0;
    if (
      /expir|valid until|renew|next (?:inspection|check|test)|due/.test(context)
    )
      score += 10;
    if (/issue|inspection date|date of check|assessment date/.test(context))
      score -= 4;
    if (new Date(`${date}T12:00:00Z`).getTime() > Date.now()) score += 3;
    candidates.push({ date, score, context });
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0] ?? null;
  return {
    kind,
    expiry: best?.date ?? null,
    confidence: best ? (best.score >= 10 && kind ? "high" : "review") : "low",
    candidates: [
      ...new Set(candidates.map((candidate) => candidate.date)),
    ].slice(0, 5),
  } as const;
}
