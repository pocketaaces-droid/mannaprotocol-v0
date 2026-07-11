import { getCitation } from "@/lib/citations";
import type { Evidence } from "@/lib/schema";

const ICON: Record<string, string> = { strong: "🟢", suggestive: "🟡", speculative: "🟠" };

export function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  const c = getCitation(evidence.citation_id);
  if (!c) return null;
  return (
    <a
      href={c.pubmed_url}
      target="_blank"
      rel="noopener noreferrer"
      className="pill"
      style={{ marginRight: "0.4rem", marginTop: "0.4rem", fontStyle: "normal", fontFamily: "var(--font-body)" }}
      title={c.study}
    >
      {ICON[evidence.confidence]} {c.study}
    </a>
  );
}

export function EvidenceRow({ evidence }: { evidence: Evidence[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", marginTop: "0.5rem" }}>
      {evidence.map((e) => <EvidenceBadge key={e.citation_id} evidence={e} />)}
    </div>
  );
}
