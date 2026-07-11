import { describe, it, expect } from "vitest";
import { collectCitationIds, findDisallowedCitationIds } from "./coach-guards";
import type { DayProtocol } from "./schema";

const protocol = {
  stations: [
    { evidence: [{ citation_id: "food_seq_shukla_prediabetic_54pct" }] },
    { evidence: [{ citation_id: "walking_reynolds_t2d" }, { citation_id: "walking_engeroff_post_vs_pre" }] },
    { evidence: [{ citation_id: "food_seq_shukla_t2d_29pct" }] },
  ],
} as unknown as DayProtocol;

describe("collectCitationIds", () => {
  it("gathers every station's citation ids", () => {
    expect(collectCitationIds(protocol).sort()).toEqual([
      "food_seq_shukla_prediabetic_54pct",
      "food_seq_shukla_t2d_29pct",
      "walking_engeroff_post_vs_pre",
      "walking_reynolds_t2d",
    ]);
  });
});

describe("findDisallowedCitationIds", () => {
  it("passes the coach's allowed evidence subset", () => {
    expect(findDisallowedCitationIds(collectCitationIds(protocol))).toEqual([]);
  });
  it("rejects real-but-off-topic corpus ids (Buffey, GLP-1)", () => {
    expect(
      findDisallowedCitationIds(["walking_buffey_meta", "glp1_semaglutide_14pct", "walking_reynolds_t2d"])
    ).toEqual(["walking_buffey_meta", "glp1_semaglutide_14pct"]);
  });
  it("rejects hallucinated ids", () => {
    expect(findDisallowedCitationIds(["made_up_study_2024"])).toEqual(["made_up_study_2024"]);
  });
});
