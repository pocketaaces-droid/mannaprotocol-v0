import type { DayProtocol } from "./schema";

/**
 * The only citations the day coach may reference — the food-order and
 * post-meal-walking evidence base. Everything else in data/citations.json
 * (GLP-1, fasting, reproductive health, Buffey) is off-topic for this tool,
 * so an id from that wider corpus is a violation even though it "exists".
 */
export const COACH_ALLOWED_CITATION_IDS = [
  "food_seq_shukla_prediabetic_54pct",
  "food_seq_shukla_t2d_29pct",
  "walking_reynolds_t2d",
  "walking_engeroff_post_vs_pre",
] as const;

const ALLOWED = new Set<string>(COACH_ALLOWED_CITATION_IDS);

/** Flatten every citation_id referenced across all stations. */
export function collectCitationIds(protocol: DayProtocol): string[] {
  return protocol.stations.flatMap((s) => s.evidence.map((e) => e.citation_id));
}

/** Ids that are unknown OR outside the coach's allowed subset. */
export function findDisallowedCitationIds(ids: string[]): string[] {
  return ids.filter((id) => !ALLOWED.has(id));
}
