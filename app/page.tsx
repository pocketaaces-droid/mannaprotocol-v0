"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MealInput, MealOrder, PostMealActivity } from "@/lib/schema";

export default function HomePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const input: MealInput = {
      meal_description: String(fd.get("meal_description") ?? "").trim(),
      meal_order: fd.get("meal_order") as MealOrder,
      post_meal_activity: fd.get("post_meal_activity") as PostMealActivity,
      email: String(fd.get("email") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Generation failed");
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
    <main className="wrap" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
      <div className="narrow">
        <span className="overline">Free educational tool — Metabolic Manna</span>
        <h1>
          Two science-backed moves to flatten <em>your post-meal spike.</em>
        </h1>
        <p style={{ fontSize: "1.15rem", marginTop: "1.5rem", marginBottom: "2.5rem" }}>
          Tell us about your meal. We&rsquo;ll show you what the research says about food
          order and post-meal walking — plus a free 7-day tracker. Cited. No medical advice.
        </p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="meal_description">What did you eat (or are about to eat)?</label>
            <textarea
              id="meal_description"
              name="meal_description"
              required
              minLength={3}
              maxLength={500}
              rows={3}
              placeholder="e.g., grilled chicken Caesar salad with a slice of bread and an iced tea"
            />
          </div>

          <div className="form-group">
            <label>In what order did you eat it?</label>
            <div className="radio-row" style={{ flexDirection: "column" }}>
              <label>
                <input type="radio" name="meal_order" value="carbs_first" required />
                Carbs first / mostly carbs alone
              </label>
              <label>
                <input type="radio" name="meal_order" value="mixed" required defaultChecked />
                Mixed all together
              </label>
              <label>
                <input type="radio" name="meal_order" value="sequenced" required />
                I sequenced it (vegetables/protein before carbs)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>What did you do right after eating?</label>
            <div className="radio-row">
              <label>
                <input type="radio" name="post_meal_activity" value="sat" required defaultChecked />
                Sat or rested
              </label>
              <label>
                <input type="radio" name="post_meal_activity" value="walked" required />
                Walked for 10+ minutes
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
            <p style={{ fontSize: "0.82rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>
              We&rsquo;ll send the 7-day Meal + Move tracker (PDF) to this email. No spam.
              One-click unsubscribe.
            </p>
          </div>

          {error && (
            <div
              className="safety-notice"
              style={{ borderColor: "#dc2626", background: "rgba(220,38,38,0.08)" }}
            >
              <p style={{ margin: 0, color: "#991b1b" }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {submitting ? "Looking up the research…" : "See what the research says →"}
          </button>

          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--color-muted)",
              marginTop: "1.5rem",
              textAlign: "center",
            }}
          >
            Educational only. Not medical advice. Always consult your healthcare provider before
            changing how you eat or exercise.
          </p>
        </form>

        <footer
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
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
            <a href="https://metabolicmanna.com">Metabolic Manna</a> · Directed by hand. Built with AI.
          </span>
          <span>
            <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
          </span>
        </footer>
      </div>
    </main>
  );
}
