import { z } from "zod";

export const ConfidenceSchema = z.enum(["strong", "suggestive", "speculative"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const EvidenceSchema = z.object({
  confidence: ConfidenceSchema,
  citation_id: z.string().min(1),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const OfficeSchema = z.enum(["morning", "midday", "evening"]);
export type Office = z.infer<typeof OfficeSchema>;

export const WalkSchema = z.object({
  when: z.string().min(3),
  why: z.string().min(10),
});

export const StationSchema = z.object({
  office: OfficeSchema,
  time_label: z.string().min(1),
  meal_echo: z.string().min(3),
  sequence_fix: z.string().min(10),
  why_it_works: z.string().min(10),
  // Haiku emits `"walk": null` for meals with no walk rather than omitting
  // the key, so accept null as well as absent (Station renderer treats both
  // as "no walk").
  walk: WalkSchema.nullish(),
  // Empty is legal: a skipped meal ("just black coffee") or one that already
  // needs no fix has nothing to cite. EvidenceRow renders nothing for [].
  evidence: z.array(EvidenceSchema),
  confidence: ConfidenceSchema,
});
export type Station = z.infer<typeof StationSchema>;

export const ScriptureSchema = z.object({
  reference: z.string().min(3),
  text: z.string().min(5),
});
export type Scripture = z.infer<typeof ScriptureSchema>;

export const DayProtocolSchema = z.object({
  day_summary: z.string().min(3),
  pattern_read: z.string().min(10),
  stations: z.array(StationSchema).length(3),
  scripture: ScriptureSchema.nullable(),
  honest_expectations: z.string().min(40),
  educational_disclaimer: z.string().min(20),
});
export type DayProtocol = z.infer<typeof DayProtocolSchema>;

export const DayInputSchema = z.object({
  breakfast: z.string().min(1).max(500),
  lunch: z.string().min(1).max(500),
  dinner: z.string().min(1).max(500),
  snacks: z.string().max(300).optional(),
  walk_windows: z.string().min(1).max(300),
});
export type DayInput = z.infer<typeof DayInputSchema>;
