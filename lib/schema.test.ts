import { describe, it, expect } from "vitest";
import { DayInputSchema, DayProtocolSchema } from "./schema";

const validInput = {
  breakfast: "Oatmeal with berries around 7:30am",
  lunch: "Turkey sandwich at my desk, 12:30",
  dinner: "Pasta with the family, 6:45pm",
  walk_windows: "After lunch maybe, evenings are open",
};

const validProtocol = {
  day_summary: "A day built around three carb-forward meals.",
  pattern_read: "Each meal leads with refined carbs and little to slow them.",
  stations: [
    {
      office: "morning",
      time_label: "~7:30a",
      meal_echo: "Oatmeal with berries",
      sequence_fix: "Eat the berries and any protein first, oats last.",
      why_it_works: "Fiber and protein slow gastric emptying.",
      evidence: [{ confidence: "suggestive", citation_id: "food_seq_shukla_prediabetic_54pct" }],
      confidence: "suggestive",
    },
    {
      office: "midday",
      time_label: "~12:30p",
      meal_echo: "Turkey sandwich",
      sequence_fix: "Protein before the bread.",
      why_it_works: "Order changes the post-meal glucose response in trials.",
      walk: { when: "right after lunch", why: "post-meal walking is linked to smaller responses" },
      evidence: [{ confidence: "suggestive", citation_id: "walking_reynolds_t2d" }],
      confidence: "suggestive",
    },
    {
      office: "evening",
      time_label: "~6:45p",
      meal_echo: "Pasta dinner",
      sequence_fix: "Salad course first, pasta after.",
      why_it_works: "Evening is when sequencing tends to matter most.",
      evidence: [{ confidence: "strong", citation_id: "walking_engeroff_post_vs_pre" }],
      confidence: "strong",
    },
  ],
  scripture: null,
  honest_expectations: "These are percent-level effects seen mostly in adults with type 2 diabetes or prediabetes.",
  educational_disclaimer:
    "Educational only. Not medical advice. If you have diabetes, are on glucose-affecting medication, or have any condition involving blood sugar, talk to your healthcare provider before changing how you eat or exercise.",
};

describe("DayInputSchema", () => {
  it("accepts a valid day input", () => {
    expect(DayInputSchema.safeParse(validInput).success).toBe(true);
  });
  it("rejects empty breakfast", () => {
    expect(DayInputSchema.safeParse({ ...validInput, breakfast: "" }).success).toBe(false);
  });
  it("allows optional snacks", () => {
    expect(DayInputSchema.safeParse({ ...validInput, snacks: "apple mid-afternoon" }).success).toBe(true);
  });
  it("rejects over-long dinner", () => {
    expect(DayInputSchema.safeParse({ ...validInput, dinner: "x".repeat(501) }).success).toBe(false);
  });
});

describe("DayProtocolSchema", () => {
  it("accepts a valid protocol", () => {
    const r = DayProtocolSchema.safeParse(validProtocol);
    expect(r.success).toBe(true);
  });
  it("requires exactly 3 stations", () => {
    expect(DayProtocolSchema.safeParse({ ...validProtocol, stations: validProtocol.stations.slice(0, 2) }).success).toBe(false);
  });
  it("accepts optional scripture object", () => {
    const withScripture = {
      ...validProtocol,
      scripture: { reference: "1 Corinthians 6:19 (BSB)", text: "Or do you not know that your body is a temple of the Holy Spirit within you" },
    };
    expect(DayProtocolSchema.safeParse(withScripture).success).toBe(true);
  });
  it("rejects an invalid office value", () => {
    const bad = { ...validProtocol, stations: [{ ...validProtocol.stations[0], office: "noon" }, validProtocol.stations[1], validProtocol.stations[2]] };
    expect(DayProtocolSchema.safeParse(bad).success).toBe(false);
  });
});
