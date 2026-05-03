import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
      <div className="narrow">
        <span className="overline">404</span>
        <h1>That page <em>wandered off</em>.</h1>
        <p>
          Whatever you were looking for isn't here. It may have moved, been
          renamed, or never existed at this URL.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "2rem" }}>
          ← Back to the Manna Protocol
        </Link>
      </div>
    </main>
  );
}
