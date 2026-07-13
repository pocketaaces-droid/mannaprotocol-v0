import { SiteHeader } from "./SiteHeader";

export function Hero() {
  return (
    <section
      style={{
        // Daylight hero: cream wash behind the ink headline, fading out right
        // so the photo carries; extra top veil keeps the header legible.
        // Lightened 2026-07-12 (Brian): peak 0.72 -> 0.45. Wash stops are
        // anchored to the CENTERED 880px content column (calc against 50%),
        // not viewport percentages — on ultrawide monitors the old %-based
        // stops left the fog in the dead space and the headline unbacked.
        backgroundImage:
          "linear-gradient(180deg, rgba(253,248,240,0.4) 0%, rgba(253,248,240,0) 18%), linear-gradient(90deg, rgba(253,248,240,0.45) calc(50% - 520px), rgba(253,248,240,0.3) calc(50% - 120px), rgba(253,248,240,0.06) calc(50% + 260px), rgba(253,248,240,0) calc(50% + 430px)), url('/protocol-hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <SiteHeader />
      <div className="wrap" style={{ padding: "3rem 1.5rem 4rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          <span className="overline">A rule of life for your metabolism</span>
          <h1 style={{ marginTop: "0.75rem" }}>
            Tell me your day.<br />I&rsquo;ll show you <em>the order.</em>
          </h1>
          <p className="lead" style={{ marginTop: "1.25rem", maxWidth: "34rem", color: "var(--color-ink-soft)" }}>
            Your meals, resequenced. Your walks, placed. Every claim cited to the research.
          </p>
        </div>
      </div>
    </section>
  );
}
