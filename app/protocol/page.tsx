"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EducationOutput, Evidence } from "@/lib/schema";
import citationsData from "@/data/citations.json";

interface CitationLite {
  id: string;
  pubmed_url: string;
  study: string;
}
const citationLookup = new Map<string, CitationLite>(
  (citationsData as { claims: CitationLite[] }).claims.map((c) => [c.id, c])
);

function EvidenceBadge({ confidence, citation_id }: Evidence) {
  const citation = citationLookup.get(citation_id);
  const icon =
    confidence === "strong" ? "🟢" : confidence === "suggestive" ? "🟡" : "🟠";
  if (!citation) return null;
  return (
    <a
      href={citation.pubmed_url}
      target="_blank"
      rel="noopener"
      className={`evidence-badge ${confidence}`}
      title={citation.study}
    >
      <span aria-hidden>{icon}</span>
      <span>{confidence}</span>
    </a>
  );
}

function EvidenceRow({ evidence }: { evidence: Evidence[] }) {
  if (!evidence.length) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginTop: "0.75rem",
      }}
    >
      {evidence.map((e, i) => (
        <EvidenceBadge key={i} {...e} />
      ))}
    </div>
  );
}

export default function ProtocolPage() {
  const [data, setData] = useState<EducationOutput | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("manna-coach-output");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        // fall through to empty state
      }
    }
  }, []);

  if (!data) {
    return (
      <main className="wrap" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
        <div className="narrow">
          <h1>No reading found</h1>
          <p>It looks like you came here directly. Start over to see what the research says.</p>
          <Link href="/" className="btn btn-primary">
            ← Start over
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
      <div className="narrow">
        <span className="overline">Meal + Move Coach — what the research says</span>
        <h1>
          <em>{data.meal_summary}</em>
        </h1>

        {/* Card A — Pattern Read */}
        <div
          className="day-card"
          style={{ marginTop: "2.5rem", borderColor: "var(--color-sage)" }}
        >
          <div className="day-num">PATTERN READ</div>
          <h4>{data.pattern_read.headline}</h4>
          <p>{data.pattern_read.body}</p>
          <EvidenceRow evidence={data.pattern_read.evidence} />
        </div>

        {/* Card B — Sequencing Fix */}
        <div className="food-card">
          <span className="overline">The sequencing fix</span>
          <h2>{data.sequencing_fix.headline}</h2>
          <p>{data.sequencing_fix.body}</p>
          <div className="order">
            {data.sequencing_fix.order.map((step, i) => (
              <div key={i} className="order-step">
                <span className="step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p style={{ fontStyle: "italic", color: "var(--color-ink-soft)" }}>
            {data.sequencing_fix.why_it_works}
          </p>
          <EvidenceRow evidence={data.sequencing_fix.evidence} />
        </div>

        {/* Card C — Walk Add-On */}
        <div
          className="food-card"
          style={{ borderColor: "var(--color-sage-deep)", background: "rgba(124, 154, 142, 0.08)" }}
        >
          <span className="overline">The walk add-on</span>
          <h2>{data.walking_add_on.headline}</h2>
          <p>{data.walking_add_on.body}</p>
          <p style={{ fontStyle: "italic", color: "var(--color-ink-soft)" }}>
            {data.walking_add_on.action}
          </p>
          <EvidenceRow evidence={data.walking_add_on.evidence} />
        </div>

        {/* Optional scripture framing */}
        {data.scripture_framing && (
          <blockquote
            style={{
              borderLeft: "3px solid var(--color-sage)",
              paddingLeft: "1.5rem",
              margin: "2.5rem 0",
              fontStyle: "italic",
              color: "var(--color-ink-soft)",
            }}
          >
            {data.scripture_framing}
          </blockquote>
        )}

        {/* Card D — Honest Expectations */}
        <div
          className="safety-notice"
          style={{
            borderColor: "var(--color-sage)",
            background: "rgba(124, 154, 142, 0.08)",
            marginTop: "2.5rem",
          }}
        >
          <h3>{data.honest_expectations.headline}</h3>
          <p>{data.honest_expectations.body}</p>
          <EvidenceRow evidence={data.honest_expectations.evidence} />
        </div>

        {/* PDF + start over */}
        <div
          className="no-print"
          style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}
        >
          <a
            href="https://metabolicmanna.com/downloads/meal-move-tracker.pdf"
            className="btn btn-primary"
            target="_blank"
            rel="noopener"
          >
            Download the 7-day tracker (PDF)
          </a>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ background: "var(--color-sage-deep)" }}
          >
            ← Read another meal
          </Link>
        </div>

        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--color-muted)",
            marginTop: "3rem",
          }}
        >
          {data.educational_disclaimer}
        </p>

        <footer
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--color-border)",
            fontSize: "0.85rem",
            color: "var(--color-muted)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span>
            <a href="https://metabolicmanna.com">Metabolic Manna</a> · Directed by hand. Built with AI.
          </span>
          <span>
            <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
          </span>
        </footer>
      </div>
    </main>
  );
}
