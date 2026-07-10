import type { DayProtocol } from "@/lib/schema";
import { Station } from "./Station";
import { ScriptureBlock } from "./ScriptureBlock";

export function ProtocolTimeline({ protocol }: { protocol: DayProtocol }) {
  return (
    <div>
      <span className="overline">Your day protocol</span>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", margin: "0.5rem 0 1rem" }}>{protocol.day_summary}</h1>
      <p className="lead" style={{ marginBottom: "2rem" }}>{protocol.pattern_read}</p>

      {protocol.stations.map((s, i) => (
        <div key={s.office}>
          <Station station={s} />
          {protocol.scripture && i === protocol.stations.length - 2 && (
            <ScriptureBlock scripture={protocol.scripture} />
          )}
        </div>
      ))}
    </div>
  );
}
