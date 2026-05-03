import { z } from "zod";

export const ConfidenceSchema = z.enum(["strong", "suggestive", "speculative"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const EvidenceSchema = z.object({
  confidence: ConfidenceSchema,
  citation_id: z.string().min(1),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const PatternReadSchema = z.object({
  headline: z.string().min(3),
  body: z.string().min(10),
  evidence: z.array(EvidenceSchema).max(2),
});

export const SequencingFixSchema = z.object({
  headline: z.string().min(3),
  order: z.array(z.string()).length(3),
  body: z.string().min(20),
  why_it_works: z.string().min(10),
  evidence: z.array(EvidenceSchema).min(2),
});

export const WalkingAddOnSchema = z.object({
  headline: z.string().min(3),
  body: z.string().min(20),
  action: z.string().min(10),
  evidence: z.array(EvidenceSchema).min(1),
});

export const HonestExpectationsSchema = z.object({
  headline: z.string().min(3),
  body: z.string().min(40),
  evidence: z.array(EvidenceSchema).min(1),
});

export const EducationOutputSchema = z.object({
  meal_summary: z.string().min(3),
  pattern_read: PatternReadSchema,
  sequencing_fix: SequencingFixSchema,
  walking_add_on: WalkingAddOnSchema,
  scripture_framing: z.string().nullable(),
  honest_expectations: HonestExpectationsSchema,
  educational_disclaimer: z.string().min(20),
});
export type EducationOutput = z.infer<typeof EducationOutputSchema>;

export const MealOrderSchema = z.enum(["carbs_first", "mixed", "sequenced"]);
export type MealOrder = z.infer<typeof MealOrderSchema>;

export const PostMealActivitySchema = z.enum(["sat", "walked"]);
export type PostMealActivity = z.infer<typeof PostMealActivitySchema>;

export const MealInputSchema = z.object({
  meal_description: z.string().min(3).max(500),
  meal_order: MealOrderSchema,
  post_meal_activity: PostMealActivitySchema,
  email: z.string().email(),
});
export type MealInput = z.infer<typeof MealInputSchema>;
