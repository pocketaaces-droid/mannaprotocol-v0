import type { Station as StationType } from "@/lib/schema";
import { EvidenceRow } from "./EvidenceBadge";

const LABEL: Record<string, string> = { morning: "☀ Morning", midday: "☀ Midday", evening: "☾ Evening" };

export function Station({ station }: { station: StationType }) {
  const isEvening = station.office === "evening";
  return (
    <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "2px solid rgba(124,154,142,0.45)", paddingBottom: "1.75rem" }}>
      <div className="overline" style={{ color: isEvening ? "var(--color-gold)" : "var(--color-sage-deep)" }}>
        {LABEL[station.office]} · {station.time_label}
      </div>
      <div className={isEvening ? "card card-warm" : "card"} style={{ marginTop: "0.5rem" }}>
        <h3 style={{ fontSize: "1.2rem" }}>{station.meal_echo}</h3>
        <p style={{ margin: "0.5rem 0" }}>{station.sequence_fix}</p>
        <p style={{ margin: "0.5rem 0", color: "var(--color-muted)", fontStyle: "italic" }}>{station.why_it_works}</p>
        {station.walk && (
          <p style={{ margin: "0.5rem 0" }}>
            🚶 <strong>{station.walk.when}</strong> — {station.walk.why}
          </p>
        )}
        <EvidenceRow evidence={station.evidence} />
      </div>
    </div>
  );
}
