export default function Loading() {
  return (
    <main className="wrap" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="narrow" style={{ textAlign: "center" }}>
        <span className="overline">Manna Protocol</span>
        <h1>
          Generating your <em>personalized</em> protocol…
        </h1>
        <p style={{ marginTop: "1rem" }}>
          Cross-referencing your profile against the citation database.
          This takes about 10 seconds.
        </p>
      </div>
    </main>
  );
}
