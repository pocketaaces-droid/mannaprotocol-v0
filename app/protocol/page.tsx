"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { DayProtocolSchema, type DayProtocol } from "@/lib/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProtocolTimeline } from "@/components/ProtocolTimeline";
import { ExpectationsCard } from "@/components/ExpectationsCard";
import { CaptureBand } from "@/components/CaptureBand";

// The stored protocol never changes while this page is mounted, so there is
// nothing to subscribe to — useSyncExternalStore is only bridging the
// server (no sessionStorage) → client hydration boundary without
// setState-in-effect.
const emptySubscribe = () => () => {};

function useStoredProtocol(): { protocol: DayProtocol | null; hydrated: boolean } {
  const raw = useSyncExternalStore(
    emptySubscribe,
    () => sessionStorage.getItem("manna-coach-output"),
    () => null
  );
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const protocol = useMemo(() => {
    if (!raw) return null;
    try {
      const parsed = DayProtocolSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }, [raw]);
  return { protocol, hydrated };
}

export default function ProtocolPage() {
  const { protocol, hydrated } = useStoredProtocol();

  if (!hydrated) return null;

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
