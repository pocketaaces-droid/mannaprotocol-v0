import { SiteHeader } from "./SiteHeader";

export function Hero() {
  return (
    <section
      className="band-dusk"
      style={{
        backgroundImage:
          "linear-gradient(165deg, rgba(36,26,16,0.88) 0%, rgba(58,44,27,0.84) 55%, rgba(78,107,94,0.72) 150%), url('/protocol-hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <SiteHeader onDusk />
      <div className="wrap" style={{ padding: "3rem 1.5rem 4rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          <span className="overline">A rule of life for your metabolism</span>
          <h1 style={{ marginTop: "0.75rem" }}>
            Tell me your day.<br />I&rsquo;ll show you <em>the order.</em>
          </h1>
          <p className="lead" style={{ marginTop: "1.25rem", maxWidth: "34rem" }}>
            Your meals, resequenced. Your walks, placed. Every claim cited to the research.
          </p>
        </div>
      </div>
    </section>
  );
}
