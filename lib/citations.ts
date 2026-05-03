import citationsData from "@/data/citations.json";

export type Confidence = "strong" | "suggestive" | "speculative";

export interface Citation {
  id: string;
  category: string;
  claim: string;
  confidence: Confidence;
  study: string;
  journal: string;
  pubmed_url: string;
  verified: boolean;
  use_when: string;
}

interface CitationsFile {
  _meta: Record<string, unknown>;
  claims: Citation[];
}

const data = citationsData as CitationsFile;

const citationMap = new Map<string, Citation>(
  data.claims.map((c) => [c.id, c])
);

export function getCitation(id: string): Citation | undefined {
  return citationMap.get(id);
}

export function allCitations(): Citation[] {
  return data.claims;
}

export function citationsByCategory(category: string): Citation[] {
  return data.claims.filter((c) => c.category === category);
}

/**
 * Returns the JSON-serialized citations block to inject into the system prompt.
 * Strips _meta to keep the prompt lean. Cached as a const so we serialize once.
 */
export const CITATIONS_FOR_PROMPT = JSON.stringify(
  { claims: data.claims.map(({ verified: _v, use_when: _u, ...rest }) => rest) },
  null,
  2
);

/**
 * Validates that a generated output's citation_id references actually exist.
 * Returns array of unknown IDs, empty if all valid.
 */
export function findUnknownCitationIds(ids: string[]): string[] {
  return ids.filter((id) => !citationMap.has(id));
}
