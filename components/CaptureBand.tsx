"use client";

import { useState } from "react";

export function CaptureBand() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, magnet: "meal-move-tracker" }),
      });
      if (!res.ok) throw new Error("Could not sign you up. Try again in a moment.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <div className="card card-warm no-print" style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ margin: 0 }}>Check your inbox — the tracker PDF is on its way.</p>
      </div>
    );
  }

  return (
    <div className="card card-warm no-print" style={{ marginTop: "2rem" }}>
      <div className="overline" style={{ marginBottom: "0.5rem" }}>Keep the rhythm</div>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Get the tracker PDF + weekly protocol notes</h3>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input type="email" name="email" required placeholder="you@example.com" style={{ flex: "1 1 220px" }} />
        <button type="submit" className="btn-primary btn-gold" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send it"}
        </button>
      </form>
      {error && <p style={{ margin: "0.75rem 0 0", color: "#991b1b", fontSize: "0.85rem" }}>{error}</p>}
      <p style={{ margin: "0.75rem 0 0", fontSize: "0.82rem", color: "var(--color-muted)" }}>
        No spam. One-click unsubscribe. <strong>Pro is coming</strong> — subscribers hear first.
      </p>
    </div>
  );
}
