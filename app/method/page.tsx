import Link from "next/link";
import { getCitation } from "@/lib/citations";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "The Method — Manna Protocol",
  description: "How food order and post-meal walking work, the evidence behind the day protocol, and what this tool deliberately does not do.",
};

const USED_CITATIONS = [
  "food_seq_shukla_prediabetic_54pct",
  "food_seq_shukla_t2d_29pct",
  "walking_reynolds_t2d",
  "walking_engeroff_post_vs_pre",
];

export default function MethodPage() {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "3rem 1.5rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          <span className="overline">The method</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", margin: "0.5rem 0 1.5rem" }}>
            Two levers, <em>well understood.</em>
          </h1>

          <h3>Food order</h3>
          <p>Eating vegetables and protein before carbohydrates slows gastric emptying, so glucose reaches the bloodstream more gradually. In adults with prediabetes, a carbohydrate-last food order produced up to a 54% reduction in the incremental glucose peak (Shukla 2019); in adults with type 2 diabetes, roughly 29% at 30 minutes (Shukla 2015).</p>

          <h3>Post-meal walking</h3>
          <p>A short walk after eating is independently linked to smaller post-meal glucose responses. In 41 adults with type 2 diabetes, three 10-minute post-meal walks lowered post-meal glucose about 12% overall and about 22% after dinner, beating a single 30-minute walk (Reynolds 2016). A 2023 meta-analysis found post-meal exercise more effective than pre-meal, with the benefit attenuating past roughly 29 minutes (Engeroff 2023).</p>

          <h3>How to read the confidence labels</h3>
          <p>🟢 strong · 🟡 suggestive · 🟠 speculative — every claim in your protocol carries one, matched to the weakest study behind it.</p>

          <h3>The evidence</h3>
          <ul>
            {USED_CITATIONS.map((id) => {
              const c = getCitation(id);
              if (!c) return null;
              return (
                <li key={id} style={{ marginBottom: "0.6rem" }}>
                  <a href={c.pubmed_url} target="_blank" rel="noopener noreferrer" className="link-underline">{c.study}</a>
                  <span style={{ color: "var(--color-muted)" }}> — {c.journal}</span>
                </li>
              );
            })}
          </ul>

          <h3>What this is not</h3>
          <p>This is an educational summary of published research on food order and post-meal walking. It is not a prediction of your body&rsquo;s response, not a CGM reading, and not medical advice. The largest effects in these studies were seen in adults with type 2 diabetes or prediabetes. Healthy adults transiently spike above 140 after typical meals — that is normal physiology, not disease. Individual responses vary. Anyone with diabetes, on glucose-affecting medication, or with a condition involving blood sugar should talk to their healthcare provider before changing how they eat or exercise.</p>

          <div style={{ marginTop: "2rem" }}>
            <Link href="/" className="btn-primary btn-gold">Build my day protocol</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
