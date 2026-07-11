"use client";

import { SiteHeader } from "@/components/SiteHeader";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Something broke</h1>
        <p style={{ margin: "1rem 0 2rem" }}>Try again — it&rsquo;s usually momentary.</p>
        <button className="btn-primary btn-gold" onClick={() => reset()}>Retry</button>
      </section>
    </main>
  );
}
