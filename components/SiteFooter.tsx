export function SiteFooter() {
  return (
    <footer
      className="wrap no-print"
      style={{
        marginTop: "4rem",
        paddingTop: "2rem",
        paddingBottom: "3rem",
        borderTop: "1px solid var(--color-border)",
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <span>
        <a href="https://metabolicmanna.com" className="link-underline">Metabolic Manna</a> · Directed by hand. Built with AI.
      </span>
      <span>
        <a href="/method">Method</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
      </span>
    </footer>
  );
}
