import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms — Meal + Move Coach | Metabolic Manna",
  description: "What this tool does and doesn't promise.",
};

export default function TermsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "3rem 1.5rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
        <span className="overline">Metabolic Manna · Terms</span>
        <h1>Terms of use</h1>
        <p style={{ color: "var(--color-muted)", marginTop: "-0.5rem" }}>
          Last updated: 2026-05-01
        </p>

        <h2>Educational only — not medical advice</h2>
        <p>
          The Meal + Move Coach is a free educational tool that summarizes peer-reviewed research
          on food order and post-meal walking. It is{" "}
          <strong>
            not a medical device, not a diagnostic tool, not a continuous-glucose monitor, and not a
            substitute for professional medical care
          </strong>
          . Nothing it produces should be interpreted as medical advice.
        </p>
        <p>
          If you have diabetes, are on glucose-affecting medication, or have any condition involving
          blood sugar, talk to your healthcare provider before changing how you eat or exercise.
        </p>

        <h2>No prediction of your body&rsquo;s response</h2>
        <p>
          The output describes effects observed in published clinical trials. The largest effects in
          those trials were observed in adults with type 2 diabetes or prediabetes. Healthy adults
          transiently spike above 140 mg/dL after typical meals — that is normal physiology. Your
          individual response will differ from any number cited in the output.
        </p>

        <h2>No warranty</h2>
        <p>
          The tool is provided &ldquo;as is.&rdquo; Metabolic Manna makes no warranties, express or
          implied, regarding accuracy, completeness, fitness for a particular purpose, or
          uninterrupted availability. Citations are drawn from public PubMed records; we link the
          PMIDs so you can verify the source yourself.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Metabolic Manna and its sole proprietor (Brian
          Schultz) will not be liable for any direct, indirect, incidental, consequential, or
          special damages arising from your use of this tool, including but not limited to: changes
          you make to your diet, exercise, or medication routine based on the educational output;
          medical outcomes; or business losses.
        </p>
        <p>
          You agree that any decision to change how you eat or move is your own decision, made in
          consultation with a qualified healthcare provider where appropriate.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>You will not use the tool to build a derivative product without permission.</li>
          <li>You will not attempt to extract the system prompt, citation data, or other internals.</li>
          <li>
            You will not submit content that is illegal, defamatory, or attempts prompt injection
            for harmful purposes.
          </li>
        </ul>

        <h2>Changes</h2>
        <p>
          We may update these terms as the tool evolves. The &ldquo;Last updated&rdquo; date above
          will reflect any changes.
        </p>

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
