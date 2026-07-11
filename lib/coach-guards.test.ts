import { describe, it, expect } from "vitest";
import { collectCitationIds, findDisallowedCitationIds, sanitizeSecondPersonMedical } from "./coach-guards";
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

describe("sanitizeSecondPersonMedical", () => {
  const wrap = (why: string) =>
    ({ stations: [{ office: "midday", walk: { when: "after lunch", why }, evidence: [] }] }) as unknown as DayProtocol;

  it("rewrites 'your glucose' to 'the glucose' in nested strings", () => {
    const { protocol, replacements } = sanitizeSecondPersonMedical(wrap("a walk helps lower your glucose after meals"));
    expect(replacements).toBe(1);
    expect((protocol.stations[0].walk as { why: string }).why).toBe("a walk helps lower the glucose after meals");
  });
  it("preserves sentence-initial capitalization", () => {
    const { protocol } = sanitizeSecondPersonMedical(wrap("Your blood sugar rises after meals"));
    expect((protocol.stations[0].walk as { why: string }).why).toBe("The blood sugar rises after meals");
  });
  it("leaves clean text untouched with zero replacements", () => {
    const clean = "the post-meal glucose response is smaller in trials";
    const { protocol, replacements } = sanitizeSecondPersonMedical(wrap(clean));
    expect(replacements).toBe(0);
    expect((protocol.stations[0].walk as { why: string }).why).toBe(clean);
  });
  it("does not touch 'your healthcare provider'", () => {
    const text = "talk to your healthcare provider before changing how you eat";
    const { replacements } = sanitizeSecondPersonMedical(wrap(text));
    expect(replacements).toBe(0);
  });
});
