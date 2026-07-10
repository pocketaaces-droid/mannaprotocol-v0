import type { DayProtocol } from "./schema";

/** Flatten every citation_id referenced across all stations. */
export function collectCitationIds(protocol: DayProtocol): string[] {
  return protocol.stations.flatMap((s) => s.evidence.map((e) => e.citation_id));
}
