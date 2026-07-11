import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy — Meal + Move Coach | Metabolic Manna",
  description: "What we collect and what we don't.",
};

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "3rem 1.5rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
        <span className="overline">Metabolic Manna · Privacy</span>
        <h1>Privacy</h1>
        <p style={{ color: "var(--color-muted)", marginTop: "-0.5rem" }}>
          Last updated: 2026-05-01
        </p>

        <h2>What this tool is</h2>
        <p>
          The Meal + Move Coach is a free educational tool from Metabolic Manna. It summarizes
          published research on food order and post-meal walking. It is not a medical service,
          not a CGM replacement, and not a personalized health prediction.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Your email address</strong>, so we can send you the 7-day Meal + Move tracker (PDF)
            and an occasional Metabolic Manna note. One-click unsubscribe is in every email.
          </li>
          <li>
            <strong>The text you type into the form</strong> (your meal description, meal-order radio
            choice, post-meal-activity radio choice). We use this only to generate the educational
            output you see on the next screen.
          </li>
          <li>
            <strong>Standard server logs</strong> (IP address, user-agent, timestamp). Used for rate
            limiting and abuse prevention only.
          </li>
        </ul>

        <h2>What we do NOT collect</h2>
        <ul>
          <li>No protected health information (PHI). The form does not ask for diagnoses, medications, or biometrics.</li>
          <li>No analytics tracking pixels, no third-party advertising scripts.</li>
          <li>No payment information. This tool is free.</li>
        </ul>

        <h2>Where data lives</h2>
        <p>
          Email addresses are stored by our email service provider (Namecheap Private Email + a
          newsletter list managed by Metabolic Manna). Form text is processed by Anthropic&rsquo;s
          Claude API to generate the educational output, then discarded — we don&rsquo;t keep a
          per-user database in this v0.
        </p>

        <h2>Anthropic data handling</h2>
        <p>
          Form text is sent to Anthropic&rsquo;s Claude API for inference. Per Anthropic&rsquo;s policy,
          API inputs are not used to train models. See{" "}
          <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener">
            anthropic.com/privacy
          </a>
          .
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>Unsubscribe from emails: click the unsubscribe link in any email we send.</li>
          <li>Request deletion: email <a href="mailto:brian@metabolicmanna.com">brian@metabolicmanna.com</a> and we will remove your address from the list.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Questions: <a href="mailto:brian@metabolicmanna.com">brian@metabolicmanna.com</a>
        </p>

        <p style={{ marginTop: "3rem" }}>
          <Link href="/">← Back to the coach</Link>
        </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
