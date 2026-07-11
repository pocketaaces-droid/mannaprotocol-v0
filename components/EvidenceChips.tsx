const CHIPS = [
  { k: "Sequence", v: "up to 54% smaller peaks in prediabetes (Shukla 2019)" },
  { k: "Walk", v: "22% lower after dinner in type 2 diabetes (Reynolds 2016)" },
  { k: "Repeat", v: "a daily rhythm, not a one-off" },
];

export function EvidenceChips() {
  return (
    <section className="section-alt no-print">
      <div
        className="wrap"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", padding: "1.75rem 1.5rem" }}
      >
        {CHIPS.map((c) => (
          <a key={c.k} href="/method" style={{ textAlign: "center" }}>
            <div className="overline" style={{ marginBottom: "0.35rem" }}>{c.k}</div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>{c.v}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
