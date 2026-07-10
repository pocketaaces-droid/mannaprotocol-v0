"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DayInput } from "@/lib/schema";

export function DayForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const snacks = String(fd.get("snacks") ?? "").trim();
    const input: DayInput = {
      breakfast: String(fd.get("breakfast") ?? "").trim(),
      lunch: String(fd.get("lunch") ?? "").trim(),
      dinner: String(fd.get("dinner") ?? "").trim(),
      ...(snacks ? { snacks } : {}),
      walk_windows: String(fd.get("walk_windows") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("The coach is busy right now — try again in a few minutes.");
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong building your protocol.");
      }
      const data = await res.json();
      sessionStorage.setItem("manna-coach-output", JSON.stringify(data));
      router.push("/protocol");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <section className="wrap" style={{ padding: "3rem 1.5rem 1rem" }}>
      <div className="narrow" style={{ margin: 0 }}>
        <span className="overline">Your day</span>
        <h2 style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
          Three meals and a walk window — that&rsquo;s all I need.
        </h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="breakfast">Your typical breakfast &amp; when</label>
            <textarea id="breakfast" name="breakfast" required maxLength={500} rows={2}
              placeholder="e.g., oatmeal with berries around 7:30am" />
          </div>
          <div className="form-group">
            <label htmlFor="lunch">Your typical lunch &amp; when</label>
            <textarea id="lunch" name="lunch" required maxLength={500} rows={2}
              placeholder="e.g., turkey sandwich at my desk, 12:30" />
          </div>
          <div className="form-group">
            <label htmlFor="dinner">Your typical dinner &amp; when</label>
            <textarea id="dinner" name="dinner" required maxLength={500} rows={2}
              placeholder="e.g., pasta with the family, 6:45pm" />
          </div>
          <div className="form-group">
            <label htmlFor="snacks">Snacks? <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional)</span></label>
            <textarea id="snacks" name="snacks" maxLength={300} rows={1}
              placeholder="e.g., an apple mid-afternoon" />
          </div>
          <div className="form-group">
            <label htmlFor="walk_windows">When could you realistically walk 10 minutes?</label>
            <textarea id="walk_windows" name="walk_windows" required maxLength={300} rows={2}
              placeholder="e.g., after lunch some days, evenings are open" />
          </div>

          {error && (
            <div className="safety-notice error-notice" role="alert" style={{ marginBottom: "1.25rem" }}>
              <p style={{ margin: 0, color: "#991b1b" }}>{error}</p>
            </div>
          )}

          <button type="submit" className="btn-primary btn-gold" disabled={submitting}
            style={{ width: "100%" }}>
            {submitting ? "Reading the research…" : "Build my day protocol"}
          </button>

          <p style={{ fontSize: "0.82rem", color: "var(--color-muted)", marginTop: "1.25rem", textAlign: "center" }}>
            Educational only. Not medical advice. Always consult your healthcare provider before changing how you eat or exercise.
          </p>
        </form>
      </div>
    </section>
  );
}
