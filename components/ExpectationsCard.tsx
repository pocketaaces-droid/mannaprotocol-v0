export function ExpectationsCard({ body, disclaimer }: { body: string; disclaimer: string }) {
  return (
    <div className="safety-notice" style={{ marginTop: "1rem" }}>
      <div className="overline" style={{ marginBottom: "0.5rem" }}>Honest expectations</div>
      <p style={{ margin: "0 0 0.75rem" }}>{body}</p>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>{disclaimer}</p>
    </div>
  );
}
