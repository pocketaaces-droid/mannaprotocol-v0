export function SiteHeader({ onDusk = false }: { onDusk?: boolean }) {
  return (
    <header
      className={onDusk ? "band-dusk" : undefined}
      // Inside the Hero the parent already paints the dusk photo+gradient;
      // keep the class (dusk text tokens) but suppress its own background so
      // the header doesn't repaint a second gradient over the image.
      style={{ padding: "1.1rem 0", ...(onDusk ? { background: "transparent" } : {}) }}
    >
      <div
        className="wrap"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "1.1rem" }}>
          Manna Protocol
        </span>
        <a
          href="https://metabolicmanna.com"
          className="overline"
          style={{ fontSize: "0.7rem" }}
        >
          by Metabolic Manna →
        </a>
      </div>
    </header>
  );
}
