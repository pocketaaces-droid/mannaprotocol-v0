export const BANNED_PHRASE_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\byour (spike|blood sugar|curve|response|levels|glucose)\b/i,
    reason: "second-person possessive applied to medical state",
  },
  {
    pattern: /\byou (will|can|should|must) (drop|reduce|lower|spike|crash)/i,
    reason: "predictive medical claim about the user",
  },
  {
    pattern: /\b\d+\s*(mg\/dl|mmol)\b/i,
    reason: "concrete glucose value (CGM-style claim)",
  },
  {
    pattern: /\bcure[ds]?\b|\bheal(ed|ing|s)?\b|\bmiracle\b/i,
    reason: "miracle/cure/heal language",
  },
  {
    pattern: /\bguarantee[ds]?\b|\bproven to (cure|heal|reverse)/i,
    reason: "guarantee language",
  },
  {
    pattern: /\b(any|all)\s+spikes?\s+(above|over|past)\s+\d+/i,
    reason: "pathologizing normal physiology",
  },
  {
    pattern: /\b(2|two)[\s-]minute(?:[\s-]\w+){0,3}[\s-]walks?\b/i,
    reason: "2-minute walk myth",
  },
  {
    pattern: /(?<![\d.])17\s*%/i,
    reason: "Buffey 17% misattribution",
  },
  {
    pattern: /\bprevents? (diabetes|cancer)\b/i,
    reason: "disease prevention claim",
  },
  {
    pattern: /\baids? weight loss\b/i,
    reason: "weight-loss aid claim",
  },
];

export interface BannedPhraseHit {
  pattern: string;
  reason: string;
  match: string;
}

export function scanForBannedPhrases(text: string): BannedPhraseHit[] {
  const hits: BannedPhraseHit[] = [];
  for (const { pattern, reason } of BANNED_PHRASE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      hits.push({
        pattern: pattern.source,
        reason,
        match: m[0],
      });
    }
  }
  return hits;
}
