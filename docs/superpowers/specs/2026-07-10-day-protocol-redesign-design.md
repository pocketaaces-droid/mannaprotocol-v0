# Manna Protocol v0 → Day Protocol Redesign — Design Spec

**Date:** 2026-07-10
**Repo:** `pocketaaces-droid/mannaprotocol-v0` (`C:\Users\schul\manna-protocol-v0`)
**Prod:** https://protocol.metabolicmanna.com (Vercel auto-deploy from main)
**Status:** Design approved by Brian 2026-07-10 (brainstorm session, visual companion).

## 1. Summary

Rebuild the free Meal+Move Coach from a one-meal analyzer into a **day-level protocol builder**. The user describes their typical day of eating (three meals + optional snacks + realistic walk windows); the coach returns a **Daily Office timeline** — Morning / Midday / Evening stations with sequencing fixes and walk placements, every claim cited. Visual system ports the current metabolicmanna-v5 design foundation (Warm Organic, layered CSS, Fraunces axis grading).

**Stays true to Phase 1:** free, no accounts, nothing stored server-side, education-only with all guardrails (Zod validation, citation whitelist guard, banned-phrase scanner, confidence labels, honest-expectations framing).

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Scope | Full product rethink (inputs, outputs, prompt, UI) — still Phase 1 free/education-only, no auth/persistence |
| Input shape | Light structure, one screen: breakfast / lunch / dinner (content + rough time in one field each), optional snacks, walk-windows question. **No email field on the form** |
| Output shape | Daily Office timeline: Morning/Midday/Evening stations on a vertical rail |
| Home page | Editorial landing: **dusk hero** (dark warm-ink band, NB Pro still) that "dawns" into cream, then evidence chips, then the form |
| Hero copy | Kicker: "A rule of life for your metabolism" · H1: "Tell me your day. I'll show you *the order*." (gold italic accent) · Subline: "Your meals, resequenced. Your walks, placed. Every claim cited to the research." |
| Email capture | Value-first: capture lives on the result page ("Get the tracker PDF + weekly protocol notes" → existing subscribe proxy), plus Pro-waitlist line (S9) |
| Faith element | Gentle: day structure echoes the Daily Office; one optional scripture blockquote (BSB, never NIV) between stations. Science-first tone |
| Implementation | Port v5's current design-system foundation into this repo; rebuild UI as React components (no shared package, no in-place CSS patching) |

## 3. Pages & routes

- **`/` — landing.**
  - Slim header: "Manna Protocol" wordmark + "by Metabolic Manna →" link to https://metabolicmanna.com.
  - Dusk hero band (gradient from warm-ink toward sage, like v5's /reset dusk sections) with NB Pro still, kicker/H1/subline per §2. Light-on-dark text must meet WCAG AA (≥4.5:1).
  - Evidence chips band (cream): Sequence · 54% lower peaks (Shukla 2019) / Walk · 22% after dinner (Reynolds 2016) / Repeat · daily rhythm. Chips link to `/method`.
  - **DayForm** (cream section): 3 required textareas — "Your typical breakfast & when", lunch, dinner — each accepting content + rough time in free text; optional "Snacks?" field; required "When could you realistically walk 10 minutes?" field. Gold pill submit: "Build my day protocol". Loading state on submit ("Reading the research…"). Inline visible error states.
  - Editorial footer: /method, /privacy, /terms, main-site link, AI-attribution + education-only disclaimer.
- **`/protocol` — result.** Reads `sessionStorage["manna-coach-output"]` (same key/flow as v0; no server persistence). Renders:
  1. Day headline (`day_summary`) + `pattern_read` intro (day-level pattern across the meals).
  2. **ProtocolTimeline**: vertical rail with Morning / Midday / Evening **Station** blocks. Each station: office kicker + `time_label`, `meal_echo` (their meal, reflected back), `sequence_fix` with `why_it_works`, optional walk placement (`walk.when` / `walk.why`), EvidenceBadge row (PubMed-linked citations + 🟢/🟡 confidence pill).
  3. Optional scripture blockquote (BSB) between stations, rendered only if present.
  4. **Honest expectations** closing station (`.safety-notice`-style warm card): percent-level improvements, "spiking above 140 is normal physiology" framing.
  5. Action row: "Save as PDF" (print stylesheet, client-side) · "Read another day" (back to `/`).
  6. **CaptureBand**: email field + "Get the tracker PDF + weekly protocol notes" → `/api/subscribe`. Below it, one Pro-waitlist line ("Get notified when Pro launches") using the same endpoint (tagged if trivial; same list otherwise).
  - Empty state (no sessionStorage): friendly "No protocol yet" + link home.
- **`/method` — new.** Static methodology page: how sequencing works, how post-meal walking works, the confidence-label system, full citation list, what the tool deliberately does not do (diagnose, prescribe, replace care). Editorial layout, pull quote, no API calls.
- **`/privacy`, `/terms`** — content unchanged, restyled.
- **`error.tsx`, `not-found.tsx`, `loading.tsx`** — restyled to the new system.

## 4. API & schema

`POST /api/coach` keeps: Anthropic SDK + Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), Zod input+output validation, citation whitelist guard, banned-phrase scanner, 30 req/hr/IP in-memory rate limit, education-only system framing.

**Input schema (`DayInput`):**
```ts
{
  breakfast: string,      // content + rough time, 1..500 chars
  lunch: string,          // 1..500
  dinner: string,         // 1..500
  snacks?: string,        // 0..300
  walk_windows: string    // 1..300
}
```

**Output schema (`DayProtocol`):**
```ts
{
  day_summary: string,              // headline-able one-liner
  pattern_read: string,             // day-level pattern across meals
  stations: [                       // exactly 3, in order
    {
      office: "morning" | "midday" | "evening",
      time_label: string,           // e.g. "~7:30a", derived from user's text
      meal_echo: string,            // their meal reflected back
      sequence_fix: string,         // the reorder instruction
      why_it_works: string,
      walk?: { when: string, why: string },   // where a walk window fits
      evidence: Citation[],         // whitelist-guarded, PubMed-linked
      confidence: "strong" | "suggestive"
    }
  ],
  scripture?: { reference: string, text: string },  // BSB only, optional
  honest_expectations: string,
  educational_disclaimer: string
}
```
- Snacks, when provided, are addressed inside the nearest station's `sequence_fix`/`why_it_works` — no fourth station.
- Prompt rewritten for day-level reasoning; retains verified numbers (Reynolds 2016: 12% overall / 22% after dinner; Shukla 2019: 54% peak reduction) and the don't-pathologize-140 framing. Citation whitelist and banned-phrase scanner re-validated against the new field set.
- `/api/subscribe` proxy unchanged.

## 5. Design system & components

**One-time port from metabolicmanna-v5's current `globals.css`:** color tokens (cream/sage/gold/warm-ink set incl. sage-deep), `@layer` structure (so utilities never die under unlayered rules), heading treatments (Fraunces axis grading, SOFT 0 roman, italic gold `em`), `.overline`/kicker convention, gold pill buttons, fluid type scale, print styles. Fonts loaded the way v5 loads them. Chip/citation text on cream uses a sage-deep tone meeting ≥4.5:1 (apply the v5 contrast lesson — #4E6B5E-class value, not #5A7A6E — from day one).

**Components (new `components/` dir; pages stop carrying inline styles):**
`SiteHeader`, `Hero`, `EvidenceChips`, `DayForm`, `ProtocolTimeline`, `Station`, `EvidenceBadge`, `ScriptureBlock`, `ExpectationsCard`, `CaptureBand`, `SiteFooter`.

Each component: one clear purpose, typed props from `@/lib/schema`, understandable without reading internals.

## 6. Assets

- **1 NB Pro hero still** — dusk table / lit walking path, no text in image (NB Pro routing per image-model rules, via higgsfield-automation). **Gate: show Brian the prompt before queueing; Brian approves the still before it ships.** Must blend into the dusk band.
- **OG image** derived from the hero (poster pattern). Favicon: simple wordmark treatment (no AI text generation needed).

## 7. Error handling

- Form: client-side required-field checks; API failure → visible inline error card (no silent success); 429 → "The coach is busy — try again in a few minutes."
- Result page: malformed/missing sessionStorage → empty state, never a crash.
- API: Zod reject → 400 with safe message; scanner/citation-guard failure → fail closed with 500 + safe message (matches v0's actual behavior; the client shows a visible retryable error). Coach citations are additionally restricted to the food-order/walking subset (`COACH_ALLOWED_CITATION_IDS`), enforced in both prompt and route guard.

## 8. Testing & verification

- Unit tests: `DayInput`/`DayProtocol` Zod schemas, citation guard and banned-phrase scanner against the new shape, station-order invariant. (Add vitest if the repo lacks a runner.)
- Flow verification in preview: form → API → result timeline; empty state; error states; print stylesheet; mobile + desktop; light-on-dark contrast in the dusk hero.
- Live API smoke test post-deploy (same discipline as v0's S7): POST returns valid `DayProtocol`, science numbers correct, guardrails clean.

## 9. Ship flow

Branch → PR with prefilled compare URL saved to `Downloads\pr-link.txt` (no gh CLI) → Brian merges → Vercel auto-deploy → prod smoke test. Next 16.2.6 already clears the Vercel CVE gate; do not downgrade. New `launch.json` entry for the protocol dev server (primary-dir gotcha applies).

## 10. Out of scope

- Accounts, saved protocols, payments, Supabase — Phase 2 (Pro).
- Emailing the generated protocol (needs new backend in the main-site repo).
- Multi-turn chat.
- Main-site changes (nav link to the protocol = separate S8 launch task).
- Changing rate-limit or model.
