import { SiteHeader } from "./SiteHeader";

export function Hero() {
  return (
    <section
      style={{
        // Daylight hero: cream wash strongest on the left (behind the ink
        // headline) fading out right so the photo carries; extra top veil
        // keeps the header legible over the image.
        backgroundImage:
          "linear-gradient(180deg, rgba(253,248,240,0.85) 0%, rgba(253,248,240,0) 22%), linear-gradient(100deg, rgba(253,248,240,0.92) 0%, rgba(253,248,240,0.72) 42%, rgba(253,248,240,0.25) 72%, rgba(253,248,240,0.05) 100%), url('/protocol-hero.jpg')",
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
