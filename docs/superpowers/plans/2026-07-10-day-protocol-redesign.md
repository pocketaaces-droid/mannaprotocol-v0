# Day Protocol Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the free Meal+Move Coach into a day-level protocol builder — light-structure day form → Daily Office timeline output — reskinned to the current metabolicmanna-v5 design system, staying Phase 1 (free, no accounts, education-only, all guardrails intact).

**Architecture:** Next.js 16 App Router, no Tailwind. Port the v5 design foundation (CSS custom properties + component classes) into `app/globals.css` as plain CSS, load Playfair Display + Source Sans 3 via `next/font`. Rewrite the Zod schemas (`DayInput` / `DayProtocol`) and the coach system prompt for day-level reasoning; keep the pipeline (citation whitelist guard, banned-phrase scanner, rate limit). Rebuild UI as focused React components under `components/`, replacing today's inline-styled pages. Result still passes via `sessionStorage`; email capture moves to the result page.

**Tech Stack:** Next 16.2.6, React 19, TypeScript, Anthropic SDK (Haiku 4.5), Zod, vitest (added), next/font (Playfair Display + Source Sans 3).

**Reference (read before starting):**
- Spec: `docs/superpowers/specs/2026-07-10-day-protocol-redesign-design.md`
- Design-system source of truth: `C:\Users\schul\metabolicmanna-v5\src\app\globals.css` (tokens lines 1–43, base/component classes 46–290, `.band-dusk` ~494–576) and `C:\Users\schul\metabolicmanna-v5\src\app\layout.tsx` (font loading).
- Citation whitelist: `data/citations.json` (do NOT invent IDs; only these exist).

**Guardrail invariants (must hold after every task that touches the API):** no `mg/dL` unit in output text; percentages always carry a population qualifier; `walking_reynolds_t2d` (not `walking_buffey_meta`) for single-walk effects; verbatim `educational_disclaimer`; scripture is BSB-only and optional.

---

## Task 0: Branch & tooling setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `.gitignore` entry check
- Create: `.claude/launch.json` (repo root)

Work happens on branch `redesign/day-protocol` (already created; the spec commit `926eb50` is its first commit).

- [ ] **Step 1: Confirm branch**

Run: `git -C C:/Users/schul/manna-protocol-v0 branch --show-current`
Expected: `redesign/day-protocol`

- [ ] **Step 2: Add vitest to package.json**

Add to `devDependencies`: `"vitest": "^2.1.0"`. Add to `scripts`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: Install**

Run: `cd C:/Users/schul/manna-protocol-v0 && npm install`
Expected: vitest added, lockfile updated, no CVE-High errors.

- [ ] **Step 5: Create `.claude/launch.json`**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "manna-protocol-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000
    }
  ]
}
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .claude/launch.json
git commit -m "chore: add vitest + protocol dev launch config"
```

---

## Task 1: Port the v5 design system into globals.css

**Files:**
- Modify: `app/globals.css` (full replacement)
- Modify: `app/layout.tsx` (font loading)

This is a visual-only foundation task (no unit test; verified in preview later). Port the **current** v5 system: Playfair Display headings, Source Sans 3 body, the full token set including dusk tokens, and the component classes the new UI needs. No Tailwind — write plain CSS. Keep class names identical to v5 so future re-syncs are mechanical.

- [ ] **Step 1: Replace `app/globals.css`**

Replace the entire file with the ported foundation below. (Sourced from v5 globals.css; Tailwind `@import`/`@theme`/`@layer` interplay removed since this app has no utilities — heading/em/anchor rules are safe unlayered here.)

```css
:root {
  --color-bg: #FDF8F0;
  --color-bg-alt: #F5EBD7;
  --color-surface: #FFFFFF;
  --color-surface-warm: #FAF2E1;
  --color-ink: #3D2E1F;
  --color-ink-soft: #5C4A38;
  --color-muted: #8B7355;
  --color-sage: #7C9A8E;
  --color-sage-deep: #4E6B5E; /* v5 contrast fix: ≥4.5:1 on cream */
  --color-gold: #B8860B;
  --color-gold-soft: #D4A843;
  --color-gold-hover: #9E6F0A;
  --color-border: rgba(61, 46, 31, 0.12);
  --color-border-strong: rgba(61, 46, 31, 0.24);
  --color-dusk: #241A10;
  --color-dusk-ink: #FAF6ED;
  --color-dusk-ink-soft: rgba(250, 246, 237, 0.82);
  --color-dusk-border: rgba(250, 246, 237, 0.3);
  --font-heading: var(--font-playfair), Georgia, serif;
  --font-body: var(--font-source-sans), -apple-system, sans-serif;
  --radius-sm: 10px;
  --radius-md: 14px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-ink-soft);
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  color: var(--color-ink);
  word-spacing: 0.05em;
  letter-spacing: -0.015em;
  line-height: 1.12;
  font-weight: 500;
  text-wrap: balance;
  margin: 0;
}
h1 { letter-spacing: -0.03em; line-height: 1.02; font-size: clamp(2.5rem, 6vw, 4.5rem); }
h2 { font-size: clamp(2rem, 4.5vw, 3.25rem); }
h3 { letter-spacing: -0.015em; line-height: 1.2; font-size: clamp(1.4rem, 2.4vw, 1.9rem); }
h4 { font-size: 1.125rem; line-height: 1.35; }

em { font-style: italic; color: var(--color-gold); padding-right: 0.18em; }

a { color: inherit; text-decoration: none; transition: color 0.2s ease; }

p { margin: 0 0 1rem; }

.overline {
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-sage-deep);
}

.lead { font-size: clamp(1.125rem, 1.1rem + 0.4vw, 1.25rem); line-height: 1.6; }

.wrap { max-width: 880px; margin: 0 auto; padding: 0 1.5rem; }
.narrow { max-width: 640px; margin: 0 auto; }

:where(a, button, input, textarea, select, summary):focus-visible {
  outline: 3px solid var(--color-ink);
  outline-offset: 2px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  background: var(--color-ink);
  color: var(--color-bg);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 999px;
  border: 0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(61, 46, 31, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, background 0.2s ease;
}
.btn-primary:hover { background: var(--color-dusk); color: var(--color-bg); transform: translateY(-2px); }
.btn-primary:active { transform: translateY(0) scale(0.97); transition-duration: 0.08s; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-primary.btn-gold {
  background: var(--color-gold-soft);
  color: #2B2118;
  box-shadow: 0 2px 10px rgba(61, 46, 31, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.btn-primary.btn-gold:hover { background: #C09638; color: #2B2118; }
.btn-primary.btn-gold:focus-visible { outline-color: var(--color-gold); }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  background: transparent;
  color: var(--color-ink);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.btn-outline:hover { background: var(--color-surface-warm); transform: translateY(-1px); }

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.9rem;
  background: rgba(124, 154, 142, 0.12);
  color: var(--color-sage-deep);
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 0.82rem;
  border-radius: 999px;
  border: 1px solid rgba(124, 154, 142, 0.25);
}

.section-alt { background: var(--color-bg-alt); }
.section-warm { background: var(--color-surface-warm); }

/* Dusk band — dark hero surface. Mirrors v5 .band-dusk token overrides. */
.band-dusk {
  background: linear-gradient(165deg, var(--color-dusk) 0%, #3A2C1B 60%, #4E6B5E 150%);
  color: var(--color-dusk-ink);
  --color-border: var(--color-dusk-border);
  --color-gold: var(--color-gold-soft);
}
.band-dusk h1, .band-dusk h2, .band-dusk h3, .band-dusk h4 { color: var(--color-dusk-ink); }
.band-dusk em { color: var(--color-gold-soft); }
.band-dusk .overline { color: var(--color-gold-soft); }
.band-dusk .lead { color: var(--color-dusk-ink-soft); }
.band-dusk :focus-visible { outline-color: var(--color-gold-soft); }

/* Cards */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.5rem;
}
.card-warm { background: var(--color-surface-warm); }

/* Form controls */
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 600; color: var(--color-ink); margin-bottom: 0.4rem; }
textarea, input[type="text"], input[type="email"] {
  width: 100%;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.9rem;
}
textarea { resize: vertical; }

/* Safety / error notice */
.safety-notice {
  background: var(--color-surface-warm);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-gold);
  border-radius: var(--radius-sm);
  padding: 1rem 1.25rem;
}
.error-notice {
  border-left-color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

/* Print — Save as PDF (result page) */
@media print {
  .no-print { display: none !important; }
  body { background: #fff; }
  .band-dusk { background: #fff; color: var(--color-ink); -webkit-print-color-adjust: exact; }
  .card { break-inside: avoid; }
}
```

- [ ] **Step 2: Swap fonts in `app/layout.tsx`**

Replace the Fraunces/DM Sans `<link>` loading with `next/font` (matches v5). Set the top of the file and the `<html>`/`<body>`:

```tsx
import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  style: ["normal", "italic"],
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://protocol.metabolicmanna.com"),
  title: "Manna Protocol — Order your day, steady your blood sugar",
  description:
    "A free, education-only day protocol: your meals resequenced and your walks placed, cited to published research. By Metabolic Manna.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

(If the existing `layout.tsx` has other metadata/OG fields, preserve them but update the title/description/metadataBase as above. OG image is added in Task 12.)

- [ ] **Step 3: Verify build compiles**

Run: `cd C:/Users/schul/manna-protocol-v0 && npx tsc --noEmit`
Expected: no errors. (The old `app/page.tsx` and `app/protocol/page.tsx` still reference old schema types — they are replaced in later tasks; if tsc errors only from those files, that's expected and resolved by Tasks 6–9. To keep this task green, run tsc after Task 9, OR temporarily accept the known errors and note them.)

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: port v5 design system (Playfair + Source Sans, dusk band, tokens)"
```

---

## Task 2: Rewrite the Zod schemas

**Files:**
- Modify: `lib/schema.ts`
- Test: `lib/schema.test.ts`

Replace the single-meal schemas with day-level `DayInput` and `DayProtocol`. Keep `ConfidenceSchema` and `EvidenceSchema`. Remove `MealInput`, `MealOrder`, `PostMealActivity`, `EducationOutput` and their sub-schemas (Task 5 updates the only consumer). `confidence` in the UI uses "strong"/"suggestive"; keep "speculative" in the enum since some citations carry it.

- [ ] **Step 1: Write the failing test**

Create `lib/schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:/Users/schul/manna-protocol-v0 && npx vitest run lib/schema.test.ts`
Expected: FAIL — `DayInputSchema` / `DayProtocolSchema` not exported.

- [ ] **Step 3: Rewrite `lib/schema.ts`**

```ts
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
  walk: WalkSchema.optional(),
  evidence: z.array(EvidenceSchema).min(1),
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:/Users/schul/manna-protocol-v0 && npx vitest run lib/schema.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts lib/schema.test.ts
git commit -m "feat: DayInput + DayProtocol schemas (day-level)"
```

---

## Task 3: Rewrite the coach system prompt

**Files:**
- Modify: `lib/prompts.ts`
- Test: `lib/prompts.test.ts`

Rewrite `SYSTEM_PROMPT` for day-level reasoning (3 stations, one per meal) and `buildUserMessage(input: DayInput)`. Keep all ABSOLUTE RULES verbatim (they are load-bearing safety). The station output is more personalized than v0's fixed cards, but the guardrails and citation IDs are unchanged. Only test the stable, mechanical facts (not LLM prose).

- [ ] **Step 1: Write the failing test**

Create `lib/prompts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";
import type { DayInput } from "./schema";

const input: DayInput = {
  breakfast: "Oatmeal 7:30",
  lunch: "Sandwich noon",
  dinner: "Pasta 7pm",
  snacks: "apple",
  walk_windows: "after lunch",
};

describe("SYSTEM_PROMPT", () => {
  it("names the three offices", () => {
    expect(SYSTEM_PROMPT).toMatch(/morning/i);
    expect(SYSTEM_PROMPT).toMatch(/midday/i);
    expect(SYSTEM_PROMPT).toMatch(/evening/i);
  });
  it("keeps the banned second-person medical rule", () => {
    expect(SYSTEM_PROMPT).toMatch(/your (spike|blood sugar|glucose)/i);
  });
  it("keeps the verbatim disclaimer", () => {
    expect(SYSTEM_PROMPT).toContain("Educational only. Not medical advice.");
  });
  it("forbids the mg/dL unit", () => {
    expect(SYSTEM_PROMPT).toMatch(/mg\/dL/); // referenced in a NEVER rule
  });
  it("mandates BSB scripture", () => {
    expect(SYSTEM_PROMPT).toMatch(/BSB/);
  });
  it("embeds the citation whitelist", () => {
    expect(SYSTEM_PROMPT).toContain("walking_reynolds_t2d");
  });
});

describe("buildUserMessage", () => {
  it("includes all day fields as JSON", () => {
    const msg = buildUserMessage(input);
    expect(msg).toContain("Oatmeal 7:30");
    expect(msg).toContain("Pasta 7pm");
    expect(msg).toContain("after lunch");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/prompts.test.ts`
Expected: FAIL — `buildUserMessage` signature mismatch / prompt strings absent.

- [ ] **Step 3: Rewrite `lib/prompts.ts`**

Keep the `CITATIONS_FOR_PROMPT` import. Replace `SYSTEM_PROMPT` and `buildUserMessage`:

```ts
import { CITATIONS_FOR_PROMPT } from "./citations";
import type { DayInput } from "./schema";

export const SYSTEM_PROMPT = `You are the Manna Protocol day coach for Metabolic Manna — a free educational tool that turns a person's typical day of eating into a "day protocol" summarizing published research on food order and post-meal walking. You do NOT predict any individual's glucose response. You do NOT give medical advice. You do NOT personalize on biology, conditions, or medications.

# YOUR ROLE
Given a person's typical breakfast, lunch, dinner (+ optional snacks) and when they could realistically walk, produce a day protocol as THREE stations — morning, midday, evening — echoing each meal and applying the same research-backed sequencing + post-meal-walk guidance. Personalization is limited to ECHOING the meals and PLACING walks in the windows they gave; the science and citations are fixed.

# ABSOLUTE RULES (override everything)

1. NEVER use second-person possessives + medical nouns.
   BANNED: "your spike", "your blood sugar", "your curve", "your response", "your levels", "your glucose"
   REQUIRED: "the post-meal glucose response", "published trials show", "research suggests", "the literature describes"

2. NEVER give a number as if it applies to THIS person.
   REQUIRED: every percentage appears in the same sentence as its population qualifier, e.g. "up to 54% in adults with prediabetes (Shukla 2019)".

3. NEVER predict the person's body's response. Describe what trials observed, not what will happen to them.

4. NEVER provide medical advice. Use "the literature suggests", "if you choose to try this".

5. NEVER pathologize normal physiology.
   REQUIRED framing: "transient spikes above 140 are normal in healthy adults; sustained elevation is the medical concern".
   Do NOT include the unit "mg/dL" in any output text. State thresholds as bare numbers ("above 140").

6. NEVER mis-attribute walking effects. For single post-meal walks cite Reynolds 2016 (walking_reynolds_t2d: 12% overall, 22% after dinner in adults with type 2 diabetes) and Engeroff 2023 (walking_engeroff_post_vs_pre). NEVER cite Buffey (walking_buffey_meta) here and NEVER use "17%" or "2-minute walks".

7. ALWAYS include educational_disclaimer field, verbatim:
   "Educational only. Not medical advice. If you have diabetes, are on glucose-affecting medication, or have any condition involving blood sugar, talk to your healthcare provider before changing how you eat or exercise."

8. ALWAYS use BSB (Berean Standard Bible) for scripture, never NIV/ESV/NASB/NLT.

# BRAND VOICE
- Science is the evidence. Christianity is the identity. Say "Christian" openly when scripture is referenced.
- Warm, clear, confident. Never hype, clinical, or preachy.
- Never use: cure, heal, miracle, transformation, breakthrough, guarantee.

# STATION STRUCTURE (produce exactly 3, in this order)

Each station:
- office: "morning" | "midday" | "evening" (morning=breakfast, midday=lunch, evening=dinner)
- time_label: a short clock label inferred from the person's text (e.g. "~7:30a"); if no time given, use "morning"/"midday"/"evening" as the label.
- meal_echo: a short, warm echo of that meal in brand voice.
- sequence_fix: the concrete reorder for THAT meal — vegetables/fiber, then protein + fats, then carbohydrates last. Reference the food they named.
- why_it_works: one sentence of mechanism in qualified language (e.g. "Protein and fiber slow gastric emptying so glucose reaches the bloodstream more gradually.").
- walk (OPTIONAL): include only if a walk window they gave fits near this meal. { when: echoes their window, why: post-meal walking is independently linked to smaller responses (Reynolds 2016) }.
- evidence: 1-2 citation_ids from the CITATIONS block. Sequencing stations cite food_seq_shukla_prediabetic_54pct and/or food_seq_shukla_t2d_29pct; walk-bearing stations may add walking_reynolds_t2d and/or walking_engeroff_post_vs_pre.
- confidence: "strong" | "suggestive" matching the weakest cited evidence.

If snacks were given, fold one line about them into the NEAREST station's sequence_fix or why_it_works. Do NOT add a fourth station.

# TOP-LEVEL FIELDS
- day_summary: one warm headline-able sentence naming the day's overall pattern.
- pattern_read: 1-2 sentences on the pattern ACROSS the three meals (qualified language only).
- scripture: EITHER null (most outputs) OR { "reference": "1 Corinthians 6:19 (BSB)", "text": "verse text" } — a single short BSB verse about body stewardship (1 Cor 6:19, Rom 12:1, 1 Cor 10:31). Never preachy, never the focus. If unsure, null.
- honest_expectations: cover (a) what this is — an educational summary of published research on food order and post-meal walking; (b) what it isn't — a prediction of the person's response, a CGM reading, or medical advice; (c) the largest effects were in adults with type 2 diabetes or prediabetes; (d) healthy adults transiently spike above 140 after typical meals — normal physiology (no "mg/dL"); (e) individual responses vary; (f) anyone with diabetes, on glucose-affecting medication, or with blood-sugar conditions should talk to their provider first.
- educational_disclaimer: the verbatim string from rule 7.

# CITATIONS BLOCK
Reference these by id in evidence.citation_id. Do NOT invent citations. Do NOT use any id not in this block.

${CITATIONS_FOR_PROMPT}

# OUTPUT — STRICT JSON ONLY
Output raw JSON only. No markdown fences. No commentary. Start with { and end with }. Match this exact shape:

{
  "day_summary": "string",
  "pattern_read": "string",
  "stations": [
    {
      "office": "morning",
      "time_label": "~7:30a",
      "meal_echo": "string",
      "sequence_fix": "string",
      "why_it_works": "string",
      "walk": { "when": "string", "why": "string" },
      "evidence": [{ "confidence": "suggestive", "citation_id": "food_seq_shukla_prediabetic_54pct" }],
      "confidence": "suggestive"
    }
    // ...midday, evening
  ],
  "scripture": null,
  "honest_expectations": "string",
  "educational_disclaimer": "Educational only. Not medical advice. If you have diabetes, are on glucose-affecting medication, or have any condition involving blood sugar, talk to your healthcare provider before changing how you eat or exercise."
}

# FINAL
Generate now. Output raw JSON. Start with { end with }.`;

export function buildUserMessage(input: DayInput): string {
  return JSON.stringify({
    breakfast: input.breakfast,
    lunch: input.lunch,
    dinner: input.dinner,
    snacks: input.snacks ?? null,
    walk_windows: input.walk_windows,
    instructions:
      "Produce a 3-station day protocol per the system prompt. Echo each meal, place walks only in the windows given, use canonical citations only. Output raw JSON only.",
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/prompts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/prompts.ts lib/prompts.test.ts
git commit -m "feat: day-level coach system prompt + user message"
```

---

## Task 4: Update the coach API route

**Files:**
- Modify: `app/api/coach/route.ts`
- Test: `lib/coach-guards.test.ts`

Update the route for the new schema: parse `DayInputSchema`, validate `DayProtocolSchema`, collect citation IDs by iterating `stations[].evidence`, keep the banned-phrase scan over the serialized output. **Remove the `fireSubscribe` call and the `email` dependency** — email is no longer on the form (capture moved to the result page → `/api/subscribe`). Extract the citation-collection into a pure helper so it is unit-testable.

- [ ] **Step 1: Write the failing test**

Create `lib/coach-guards.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { collectCitationIds } from "./coach-guards";
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/coach-guards.test.ts`
Expected: FAIL — module `./coach-guards` does not exist.

- [ ] **Step 3: Create `lib/coach-guards.ts`**

```ts
import type { DayProtocol } from "./schema";

/** Flatten every citation_id referenced across all stations. */
export function collectCitationIds(protocol: DayProtocol): string[] {
  return protocol.stations.flatMap((s) => s.evidence.map((e) => e.citation_id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/coach-guards.test.ts`
Expected: PASS.

- [ ] **Step 5: Update `app/api/coach/route.ts`**

Replace imports and the validation/guard section. Full file:

```ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts";
import { DayProtocolSchema, DayInputSchema } from "@/lib/schema";
import { findUnknownCitationIds } from "@/lib/citations";
import { checkRateLimit, pruneExpired } from "@/lib/rate-limit";
import { scanForBannedPhrases } from "@/lib/banned-phrases";
import { collectCitationIds } from "@/lib/coach-guards";

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  pruneExpired();
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour.", resetAt: rate.resetAt },
      { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(rate.resetAt) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const inputResult = DayInputSchema.safeParse(body);
  if (!inputResult.success) {
    return NextResponse.json(
      { error: "Invalid input", details: inputResult.error.flatten() },
      { status: 400 }
    );
  }

  let response;
  try {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildUserMessage(inputResult.data) }],
    });
  } catch (err) {
    console.error("[coach] Anthropic API error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 502 });
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "Empty response from generator" }, { status: 500 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFences(textBlock.text));
  } catch {
    console.error("[coach] non-JSON output:", textBlock.text.slice(0, 500));
    return NextResponse.json({ error: "Generator returned invalid JSON" }, { status: 500 });
  }

  const outputResult = DayProtocolSchema.safeParse(parsedJson);
  if (!outputResult.success) {
    console.error("[coach] schema validation failed:", outputResult.error.flatten());
    return NextResponse.json({ error: "Generator output failed validation" }, { status: 500 });
  }

  const out = outputResult.data;

  const unknownIds = findUnknownCitationIds(collectCitationIds(out));
  if (unknownIds.length > 0) {
    console.error("[coach] hallucinated citation IDs:", unknownIds);
    return NextResponse.json({ error: "Generator referenced unknown citations", unknownIds }, { status: 500 });
  }

  const bannedHits = scanForBannedPhrases(JSON.stringify(out));
  if (bannedHits.length > 0) {
    console.error("[coach] banned-phrase scanner hit:", bannedHits);
    return NextResponse.json({ error: "Generator output failed safety scan" }, { status: 500 });
  }

  return NextResponse.json(out, {
    headers: { "X-RateLimit-Remaining": String(rate.remaining), "X-RateLimit-Reset": String(rate.resetAt) },
  });
}
```

- [ ] **Step 6: Run tests + typecheck**

Run: `npx vitest run lib/coach-guards.test.ts && npx tsc --noEmit`
Expected: tests PASS; tsc errors, if any, only from `app/page.tsx` / `app/protocol/page.tsx` (replaced in Tasks 6–9).

- [ ] **Step 7: Commit**

```bash
git add app/api/coach/route.ts lib/coach-guards.ts lib/coach-guards.test.ts
git commit -m "feat: coach route validates DayProtocol; drop email/subscribe from coach"
```

---

## Task 5: Shared chrome components (SiteHeader, SiteFooter)

**Files:**
- Create: `components/SiteHeader.tsx`
- Create: `components/SiteFooter.tsx`

Server components (no interactivity). Both pages use them.

- [ ] **Step 1: Create `components/SiteHeader.tsx`**

```tsx
export function SiteHeader({ onDusk = false }: { onDusk?: boolean }) {
  return (
    <header
      className={onDusk ? "band-dusk" : undefined}
      style={{ padding: "1.1rem 0" }}
    >
      <div
        className="wrap"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "1.1rem" }}>
          Manna Protocol
        </span>
        <a
          href="https://metabolicmanna.com"
          className="overline"
          style={{ fontSize: "0.7rem" }}
        >
          by Metabolic Manna →
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/SiteFooter.tsx`**

```tsx
export function SiteFooter() {
  return (
    <footer
      className="wrap no-print"
      style={{
        marginTop: "4rem",
        paddingTop: "2rem",
        paddingBottom: "3rem",
        borderTop: "1px solid var(--color-border)",
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <span>
        <a href="https://metabolicmanna.com" className="link-underline">Metabolic Manna</a> · Directed by hand. Built with AI.
      </span>
      <span>
        <a href="/method">Method</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
      </span>
    </footer>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit` (ignore known old-page errors)
Expected: no NEW errors from these two files.

- [ ] **Step 4: Commit**

```bash
git add components/SiteHeader.tsx components/SiteFooter.tsx
git commit -m "feat: SiteHeader + SiteFooter chrome components"
```

---

## Task 6: Hero + EvidenceChips (landing top)

**Files:**
- Create: `components/Hero.tsx`
- Create: `components/EvidenceChips.tsx`

`Hero` is the dusk band with the approved copy. The NB Pro still is added in Task 12; for now the band uses the gradient only (design-approved to work without imagery). `EvidenceChips` is the cream strip below.

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
import { SiteHeader } from "./SiteHeader";

export function Hero() {
  return (
    <section className="band-dusk">
      <SiteHeader onDusk />
      <div className="wrap" style={{ padding: "3rem 1.5rem 4rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          <span className="overline">A rule of life for your metabolism</span>
          <h1 style={{ marginTop: "0.75rem" }}>
            Tell me your day.<br />I&rsquo;ll show you <em>the order.</em>
          </h1>
          <p className="lead" style={{ marginTop: "1.25rem", maxWidth: "34rem" }}>
            Your meals, resequenced. Your walks, placed. Every claim cited to the research.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/EvidenceChips.tsx`**

```tsx
const CHIPS = [
  { k: "Sequence", v: "up to 54% smaller peaks in prediabetes (Shukla 2019)" },
  { k: "Walk", v: "22% lower after dinner in type 2 diabetes (Reynolds 2016)" },
  { k: "Repeat", v: "a daily rhythm, not a one-off" },
];

export function EvidenceChips() {
  return (
    <section className="section-alt no-print">
      <div
        className="wrap"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", padding: "1.75rem 1.5rem" }}
      >
        {CHIPS.map((c) => (
          <a key={c.k} href="/method" style={{ textAlign: "center" }}>
            <div className="overline" style={{ marginBottom: "0.35rem" }}>{c.k}</div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>{c.v}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit` (ignore old-page errors). Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx components/EvidenceChips.tsx
git commit -m "feat: Hero (dusk) + EvidenceChips landing components"
```

---

## Task 7: DayForm (client) + landing page assembly

**Files:**
- Create: `components/DayForm.tsx`
- Modify: `app/page.tsx` (full replacement)

`DayForm` is the client component: 3 required meal textareas + optional snacks + required walk-windows, posts `DayInput` to `/api/coach`, stores result in `sessionStorage`, routes to `/protocol`. Visible error + loading states. `app/page.tsx` becomes a thin server component composing Hero + EvidenceChips + DayForm + SiteFooter.

- [ ] **Step 1: Create `components/DayForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DayInput } from "@/lib/schema";

export function DayForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const snacks = String(fd.get("snacks") ?? "").trim();
    const input: DayInput = {
      breakfast: String(fd.get("breakfast") ?? "").trim(),
      lunch: String(fd.get("lunch") ?? "").trim(),
      dinner: String(fd.get("dinner") ?? "").trim(),
      ...(snacks ? { snacks } : {}),
      walk_windows: String(fd.get("walk_windows") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("The coach is busy right now — try again in a few minutes.");
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong building your protocol.");
      }
      const data = await res.json();
      sessionStorage.setItem("manna-coach-output", JSON.stringify(data));
      router.push("/protocol");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <section className="wrap" style={{ padding: "3rem 1.5rem 1rem" }}>
      <div className="narrow" style={{ margin: 0 }}>
        <span className="overline">Your day</span>
        <h2 style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
          Three meals and a walk window — that&rsquo;s all I need.
        </h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="breakfast">Your typical breakfast &amp; when</label>
            <textarea id="breakfast" name="breakfast" required maxLength={500} rows={2}
              placeholder="e.g., oatmeal with berries around 7:30am" />
          </div>
          <div className="form-group">
            <label htmlFor="lunch">Your typical lunch &amp; when</label>
            <textarea id="lunch" name="lunch" required maxLength={500} rows={2}
              placeholder="e.g., turkey sandwich at my desk, 12:30" />
          </div>
          <div className="form-group">
            <label htmlFor="dinner">Your typical dinner &amp; when</label>
            <textarea id="dinner" name="dinner" required maxLength={500} rows={2}
              placeholder="e.g., pasta with the family, 6:45pm" />
          </div>
          <div className="form-group">
            <label htmlFor="snacks">Snacks? <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional)</span></label>
            <textarea id="snacks" name="snacks" maxLength={300} rows={1}
              placeholder="e.g., an apple mid-afternoon" />
          </div>
          <div className="form-group">
            <label htmlFor="walk_windows">When could you realistically walk 10 minutes?</label>
            <textarea id="walk_windows" name="walk_windows" required maxLength={300} rows={2}
              placeholder="e.g., after lunch some days, evenings are open" />
          </div>

          {error && (
            <div className="safety-notice error-notice" role="alert" style={{ marginBottom: "1.25rem" }}>
              <p style={{ margin: 0, color: "#991b1b" }}>{error}</p>
            </div>
          )}

          <button type="submit" className="btn-primary btn-gold" disabled={submitting}
            style={{ width: "100%" }}>
            {submitting ? "Reading the research…" : "Build my day protocol"}
          </button>

          <p style={{ fontSize: "0.82rem", color: "var(--color-muted)", marginTop: "1.25rem", textAlign: "center" }}>
            Educational only. Not medical advice. Always consult your healthcare provider before changing how you eat or exercise.
          </p>
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import { Hero } from "@/components/Hero";
import { EvidenceChips } from "@/components/EvidenceChips";
import { DayForm } from "@/components/DayForm";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <EvidenceChips />
      <DayForm />
      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors from `app/page.tsx`, Hero, DayForm. (Old `app/protocol/page.tsx` still errors until Task 9.)

- [ ] **Step 4: Commit**

```bash
git add components/DayForm.tsx app/page.tsx
git commit -m "feat: DayForm + landing page assembly"
```

---

## Task 8: Result-page building blocks (EvidenceBadge, Station, ScriptureBlock, ExpectationsCard, CaptureBand)

**Files:**
- Create: `components/EvidenceBadge.tsx`
- Create: `components/Station.tsx`
- Create: `components/ScriptureBlock.tsx`
- Create: `components/ExpectationsCard.tsx`
- Create: `components/CaptureBand.tsx`

- [ ] **Step 1: Create `components/EvidenceBadge.tsx`**

```tsx
import { getCitation } from "@/lib/citations";
import type { Evidence } from "@/lib/schema";

const ICON: Record<string, string> = { strong: "🟢", suggestive: "🟡", speculative: "🟠" };

export function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  const c = getCitation(evidence.citation_id);
  if (!c) return null;
  return (
    <a
      href={c.pubmed_url}
      target="_blank"
      rel="noopener noreferrer"
      className="pill"
      style={{ marginRight: "0.4rem", marginTop: "0.4rem", fontStyle: "normal", fontFamily: "var(--font-body)" }}
      title={c.study}
    >
      {ICON[evidence.confidence]} {c.study}
    </a>
  );
}

export function EvidenceRow({ evidence }: { evidence: Evidence[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", marginTop: "0.5rem" }}>
      {evidence.map((e, i) => <EvidenceBadge key={i} evidence={e} />)}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/Station.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `components/ScriptureBlock.tsx`**

```tsx
import type { Scripture } from "@/lib/schema";

export function ScriptureBlock({ scripture }: { scripture: Scripture }) {
  return (
    <blockquote style={{ margin: "1.5rem 0", padding: "0.5rem 0 0.5rem 1.25rem", borderLeft: "3px solid var(--color-gold)", fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--color-ink-soft)" }}>
      <p style={{ margin: 0 }}>&ldquo;{scripture.text}&rdquo;</p>
      <cite className="overline" style={{ display: "block", marginTop: "0.5rem", fontStyle: "normal" }}>{scripture.reference}</cite>
    </blockquote>
  );
}
```

- [ ] **Step 4: Create `components/ExpectationsCard.tsx`**

```tsx
export function ExpectationsCard({ body, disclaimer }: { body: string; disclaimer: string }) {
  return (
    <div className="safety-notice" style={{ marginTop: "1rem" }}>
      <div className="overline" style={{ marginBottom: "0.5rem" }}>Honest expectations</div>
      <p style={{ margin: "0 0 0.75rem" }}>{body}</p>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>{disclaimer}</p>
    </div>
  );
}
```

- [ ] **Step 5: Create `components/CaptureBand.tsx`**

```tsx
"use client";

import { useState } from "react";

export function CaptureBand() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, magnet: "meal-move-tracker" }),
      });
      if (!res.ok) throw new Error("Could not sign you up. Try again in a moment.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <div className="card card-warm no-print" style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ margin: 0 }}>Check your inbox — the tracker PDF is on its way.</p>
      </div>
    );
  }

  return (
    <div className="card card-warm no-print" style={{ marginTop: "2rem" }}>
      <div className="overline" style={{ marginBottom: "0.5rem" }}>Keep the rhythm</div>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Get the tracker PDF + weekly protocol notes</h3>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input type="email" name="email" required placeholder="you@example.com" style={{ flex: "1 1 220px" }} />
        <button type="submit" className="btn-primary btn-gold" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send it"}
        </button>
      </form>
      {error && <p style={{ margin: "0.75rem 0 0", color: "#991b1b", fontSize: "0.85rem" }}>{error}</p>}
      <p style={{ margin: "0.75rem 0 0", fontSize: "0.82rem", color: "var(--color-muted)" }}>
        No spam. One-click unsubscribe. <strong>Pro is coming</strong> — subscribers hear first.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Typecheck** — Run: `npx tsc --noEmit`. Expected: no new errors from these five files.

- [ ] **Step 7: Commit**

```bash
git add components/EvidenceBadge.tsx components/Station.tsx components/ScriptureBlock.tsx components/ExpectationsCard.tsx components/CaptureBand.tsx
git commit -m "feat: result-page building blocks (station, badge, scripture, expectations, capture)"
```

---

## Task 9: ProtocolTimeline + result page assembly

**Files:**
- Create: `components/ProtocolTimeline.tsx`
- Modify: `app/protocol/page.tsx` (full replacement)

`ProtocolTimeline` renders the day headline + pattern read + 3 stations, with the optional scripture inserted between the last two stations. The result page is a client component reading `sessionStorage` (same key/flow as v0), with the empty state and the action row (Save as PDF via `window.print()`, Read another day).

- [ ] **Step 1: Create `components/ProtocolTimeline.tsx`**

```tsx
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
```

- [ ] **Step 2: Replace `app/protocol/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DayProtocolSchema, type DayProtocol } from "@/lib/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProtocolTimeline } from "@/components/ProtocolTimeline";
import { ExpectationsCard } from "@/components/ExpectationsCard";
import { CaptureBand } from "@/components/CaptureBand";

export default function ProtocolPage() {
  const [protocol, setProtocol] = useState<DayProtocol | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("manna-coach-output");
      if (raw) {
        const parsed = DayProtocolSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setProtocol(parsed.data);
      }
    } catch {
      /* fall through to empty state */
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!protocol) {
    return (
      <main>
        <SiteHeader />
        <section className="wrap" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem" }}>No protocol yet</h1>
          <p style={{ margin: "1rem 0 2rem" }}>Tell me your day and I&rsquo;ll build one.</p>
          <Link href="/" className="btn-primary btn-gold">Start here</Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "2.5rem 1.5rem 1rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          <ProtocolTimeline protocol={protocol} />
          <ExpectationsCard body={protocol.honest_expectations} disclaimer={protocol.educational_disclaimer} />

          <div className="no-print" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <button className="btn-outline" onClick={() => window.print()}>Save as PDF</button>
            <Link href="/" className="btn-outline">Read another day</Link>
          </div>

          <CaptureBand />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 3: Typecheck (should now be fully clean)**

Run: `npx tsc --noEmit`
Expected: NO errors anywhere (old schema references all removed).

- [ ] **Step 4: Full test run**

Run: `npx vitest run`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ProtocolTimeline.tsx app/protocol/page.tsx
git commit -m "feat: ProtocolTimeline + result page assembly (day protocol)"
```

---

## Task 10: /method page

**Files:**
- Create: `app/method/page.tsx`

Static server component: the science story, confidence-label legend, full citation list (from `allCitations()` filtered to the ones this tool uses), and a "what this is not" section. No API calls.

- [ ] **Step 1: Create `app/method/page.tsx`**

```tsx
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
          <p>Eating vegetables and protein before carbohydrates slows gastric emptying, so glucose reaches the bloodstream more gradually. In adults with prediabetes, a carbohydrate-last order produced up to a 54% reduction in the incremental glucose peak (Shukla 2019); in adults with type 2 diabetes, roughly 29% at 30 minutes (Shukla 2015).</p>

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
```

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit`. Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/method/page.tsx
git commit -m "feat: /method science + evidence page"
```

---

## Task 11: Restyle legal + route-state pages

**Files:**
- Modify: `app/privacy/page.tsx`
- Modify: `app/terms/page.tsx`
- Modify: `app/error.tsx`
- Modify: `app/not-found.tsx`
- Modify: `app/loading.tsx`

Content unchanged; wrap in the new chrome and classes. For privacy/terms, add `SiteHeader`/`SiteFooter` and ensure content sits in `.wrap > .narrow`. For error/not-found, use the new button classes.

- [ ] **Step 1: Update `app/privacy/page.tsx` and `app/terms/page.tsx`**

Wrap existing body content:

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "3rem 1.5rem" }}>
        <div className="narrow" style={{ margin: 0 }}>
          {/* existing privacy copy, unchanged */}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
```

Apply the identical wrapper to `terms/page.tsx`. Preserve every paragraph of existing legal text verbatim.

- [ ] **Step 2: Update `app/not-found.tsx`**

```tsx
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Not found</h1>
        <p style={{ margin: "1rem 0 2rem" }}>That page isn&rsquo;t here.</p>
        <Link href="/" className="btn-primary btn-gold">Back to the coach</Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Update `app/error.tsx`** (keep `"use client"` + reset prop)

```tsx
"use client";

import { SiteHeader } from "@/components/SiteHeader";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Something broke</h1>
        <p style={{ margin: "1rem 0 2rem" }}>Try again — it&rsquo;s usually momentary.</p>
        <button className="btn-primary btn-gold" onClick={() => reset()}>Retry</button>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Update `app/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="wrap" style={{ padding: "5rem 1.5rem", textAlign: "center", color: "var(--color-muted)" }}>
      <p>Reading the research…</p>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: clean typecheck; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/privacy/page.tsx app/terms/page.tsx app/error.tsx app/not-found.tsx app/loading.tsx
git commit -m "feat: restyle legal + route-state pages to new system"
```

---

## Task 12: Hero image + OG metadata

**Files:**
- Create: `public/protocol-hero.jpg` (generated asset)
- Modify: `components/Hero.tsx`
- Modify: `app/layout.tsx` (OG image)
- Create: `public/protocol-og.jpg`

**GATE (per spec §6 and image-approval-gate memory):** Generate the hero with the **higgsfield-automation** skill using **Nano Banana Pro** (no text in image). **Show Brian the prompt before queueing, and Brian approves the still before it ships.** Do NOT auto-approve.

- [ ] **Step 1: Draft the NB Pro prompt and show Brian**

Draft a prompt for a dusk-lit still that blends into the `.band-dusk` gradient (warm-ink → sage): e.g. a low-light wooden table at dusk with simple whole food and a lit garden walking path beyond a window; warm gold rim-light; no text, no legible signage; 16:9. Present to Brian; wait for approval or edits.

- [ ] **Step 2: Generate + place**

After approval, generate via higgsfield-automation (NB Pro, no upscale needed for a bg image unless requested), download the approved still to `public/protocol-hero.jpg`. Derive `public/protocol-og.jpg` (1200×630) via the poster pattern.

- [ ] **Step 3: Wire the hero image into `components/Hero.tsx`**

Add a background image layer behind the dusk gradient (image under the gradient so text stays legible):

```tsx
<section
  className="band-dusk"
  style={{
    backgroundImage:
      "linear-gradient(165deg, rgba(36,26,16,0.86) 0%, rgba(58,44,27,0.82) 55%, rgba(78,107,94,0.6) 150%), url('/protocol-hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
```

(Keep the rest of Hero unchanged. Verify text contrast ≥4.5:1 over the darkest region in Task 13.)

- [ ] **Step 4: Add OG image to `app/layout.tsx` metadata**

```tsx
openGraph: {
  title: "Manna Protocol — Order your day, steady your blood sugar",
  description: "A free, education-only day protocol, cited to published research. By Metabolic Manna.",
  url: "https://protocol.metabolicmanna.com",
  siteName: "Manna Protocol",
  images: [{ url: "/protocol-og.jpg", width: 1200, height: 630 }],
  type: "website",
},
```

- [ ] **Step 5: Commit**

```bash
git add public/protocol-hero.jpg public/protocol-og.jpg components/Hero.tsx app/layout.tsx
git commit -m "feat: NB Pro dusk hero still + OG image"
```

---

## Task 13: Preview verification

**Files:** none (verification only)

Use the preview tools (launch.json entry `manna-protocol-dev`). This requires a local `ANTHROPIC_API_KEY` in the protocol repo's `.env.local` for the coach route (confirm present or ask Brian; do not commit it).

- [ ] **Step 1: Start dev server** — `preview_start` with `{name: "manna-protocol-dev"}`.

- [ ] **Step 2: Landing checks** — read_page/screenshot `/`: dusk hero renders with headline 1 + kicker + hero image; chips band; day form with 5 fields (snacks optional). Check console for errors.

- [ ] **Step 3: Contrast check** — javascript_tool: confirm hero text over the image meets AA (spot-check computed colors / visually verify legibility). If weak, darken the gradient overlay in Hero.

- [ ] **Step 4: Happy path** — fill the form, submit; confirm POST `/api/coach` returns 200 and `/protocol` renders: day summary, 3 stations (morning/midday/evening) with sequencing + walk placement + evidence badges, expectations card, capture band. Verify science: percentages carry population qualifiers; no "mg/dL"; Reynolds (not Buffey) for walks.

- [ ] **Step 5: Empty state** — open `/protocol` directly in a fresh context (clear sessionStorage); confirm "No protocol yet" + Start here.

- [ ] **Step 6: Error + rate-limit states** — temporarily point `/api/coach` to fail (or submit invalid) to confirm the visible error card; confirm 429 copy path by reading the code path (or lowering the limit locally).

- [ ] **Step 7: Print** — trigger Save as PDF (`window.print()`); confirm print stylesheet hides `.no-print` chrome and the timeline is legible on white.

- [ ] **Step 8: Responsive + method** — resize_window mobile/desktop; verify form, timeline, chips reflow. Load `/method`; confirm citations link to PubMed.

- [ ] **Step 9: Capture the proof** — screenshot the landing and a rendered protocol for Brian.

---

## Task 14: Ship

**Files:** none (deploy)

- [ ] **Step 1: Final gate** — `npx tsc --noEmit && npm run lint && npx vitest run && npm run build` all clean.

- [ ] **Step 2: Push branch** — `git push -u origin redesign/day-protocol`.

- [ ] **Step 3: Prefilled PR** — build the compare URL for `pocketaaces-droid/mannaprotocol-v0` (`https://github.com/pocketaaces-droid/mannaprotocol-v0/compare/main...redesign/day-protocol?expand=1&title=...&body=...`, URL-encoded), write it to `C:\Users\schul\Downloads\pr-link.txt`, and present it. Do NOT merge (push-to-main blocked; Brian merges).

- [ ] **Step 4: Post-merge smoke test** — after Brian merges and Vercel deploys, POST a sample day to prod `/api/coach`, confirm valid `DayProtocol` + correct science, and load the pages. (Next 16.2.6 already clears the Vercel CVE gate — do not downgrade.)

---

## Self-Review Notes

- **Spec coverage:** §3 pages → Tasks 6–11; §4 API/schema → Tasks 2–4; §5 design system → Task 1; §6 assets → Task 12; §7 errors → Tasks 7,8,11; §8 testing → Tasks 2–4,9,13; §9 ship → Task 14. All covered.
- **Font correction:** spec §5 says "Fraunces axis grading," but the LIVE v5 site uses Playfair Display + Source Sans 3 — Task 1 ports the live fonts (flagged to Brian). Sage-deep hardened to #4E6B5E (≥4.5:1) from day one per the contrast lesson.
- **Type consistency:** `DayInput`/`DayProtocol`/`Station`/`Evidence`/`Scripture`/`Office` names are used identically across Tasks 2–10. `collectCitationIds` name stable (Task 4 ↔ used in route). `manna-coach-output` sessionStorage key stable (DayForm ↔ result page).
- **Guardrails:** citation whitelist unchanged (`data/citations.json`); banned-phrase scanner and `findUnknownCitationIds` reused as-is against the new shape; `meal-move-tracker` magnet confirmed to exist in the main-site subscribe function.
