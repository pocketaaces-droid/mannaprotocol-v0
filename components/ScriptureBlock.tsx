import type { Scripture } from "@/lib/schema";

export function ScriptureBlock({ scripture }: { scripture: Scripture }) {
  return (
    <blockquote style={{ margin: "1.5rem 0", padding: "0.5rem 0 0.5rem 1.25rem", borderLeft: "3px solid var(--color-gold)", fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--color-ink-soft)" }}>
      <p style={{ margin: 0 }}>&ldquo;{scripture.text}&rdquo;</p>
      <cite className="overline" style={{ display: "block", marginTop: "0.5rem", fontStyle: "normal" }}>{scripture.reference}</cite>
    </blockquote>
  );
}
