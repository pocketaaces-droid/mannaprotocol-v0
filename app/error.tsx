"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[manna-protocol] Unhandled error:", error);
  }, [error]);

  return (
    <main className="wrap" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
      <div className="narrow">
        <span className="overline">Something broke</span>
        <h1>Well, this is <em>awkward</em>.</h1>
        <p>
          The Manna Protocol tool hit an unexpected error. This usually means
          one of three things: the generator was rate-limited, the server is
          momentarily down, or you caught us during a deploy.
        </p>
        <p>
          Your data wasn't saved anywhere (this tool doesn't store anything), so
          nothing was lost — just try again in a moment.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-primary" style={{ background: "var(--color-sage-deep)" }}>
            ← Back to the form
          </Link>
        </div>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "3rem" }}>
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
