"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DayProtocolSchema, type DayProtocol } from "@/lib/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProtocolTimeline } from "@/components/ProtocolTimeline";
import { ExpectationsCard } from "@/components/ExpectationsCard";
import { CaptureBand } from "@/components/CaptureBand";

export default function ProtocolPage() {
  const [protocol, setProtocol] = useState<DayProtocol | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("manna-coach-output");
      if (raw) {
        const parsed = DayProtocolSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setProtocol(parsed.data);
      }
    } catch {
      /* fall through to empty state */
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!protocol) {
    return (
      <main>
        <SiteHeader />
        <section className="wrap" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem" }}>No protocol yet</h1>
          <p style={{ margin: "1rem 0 2rem" }}>Tell me your day and I&rsquo;ll build one.</p>
          <Link href="/" className="btn-primary btn-gold">Start here</Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "2.5rem 1.5rem 1rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          <ProtocolTimeline protocol={protocol} />
          <ExpectationsCard body={protocol.honest_expectations} disclaimer={protocol.educational_disclaimer} />

          <div className="no-print" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <button className="btn-outline" onClick={() => window.print()}>Save as PDF</button>
            <Link href="/" className="btn-outline">Read another day</Link>
          </div>

          <CaptureBand />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
