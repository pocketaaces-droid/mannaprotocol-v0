# Meal + Move Coach (Manna Protocol v0)

Free educational tool from [Metabolic Manna](https://metabolicmanna.com). Summarizes
peer-reviewed research on food order and post-meal walking. No predictions, no
medical advice, no personalized biology.

Live at: `protocol.metabolicmanna.com` (planned).

## What it does

- 4-field form (meal description, meal order, post-meal activity, email)
- Soft-gated by email (Engineering as Marketing pattern — email is both abuse
  prevention and lead capture)
- Returns 4 text cards:
  - **A — Pattern Read** (light personalization, echoes the meal)
  - **B — Sequencing Fix** (Shukla 2015 + 2019, fixed structure)
  - **C — Walk Add-On** (Reynolds 2016 + Engeroff 2023, fixed structure)
  - **D — Honest Expectations** (load-bearing safety, Sun 2024 + Liu 2022)
- Optional 1-line BSB scripture framing (~1 in 3 outputs)
- Welcome email fires on submit with a link to the 7-day Meal + Move tracker (PDF)

## What it does NOT do

- No glucose-curve prediction. No CGM-style numbers. No `mg/dL` claims.
- No medical advice. No personalization on conditions/medications/biology.
- No second-person possessives + medical nouns ("your spike", "your blood sugar").
  These are server-side rejected.
- No Buffey 17% misattribution. No 2-minute walk myth.
- No hype words: cure, heal, miracle, transformation, breakthrough.

## Stack

- Next.js 16 (App Router)
- Anthropic SDK + Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- Zod for input + output validation
- In-memory rate limit (30/IP/hr) — Vercel KV / Upstash for v1
- No DB, no auth (v0)

## Project layout

```
manna-protocol-v0/
├── app/
│   ├── api/
│   │   ├── coach/route.ts         ← main pipeline
│   │   └── subscribe/route.ts     ← proxy to metabolicmanna.com Netlify subscribe fn
│   ├── page.tsx                   ← 4-field form
│   ├── protocol/page.tsx          ← 4-card output renderer
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   └── layout.tsx, globals.css    ← Warm Organic design system
├── lib/
│   ├── prompts.ts                 ← system prompt (cache-stable)
│   ├── schema.ts                  ← Zod schemas
│   ├── citations.ts               ← citation loader + hallucination guard
│   ├── banned-phrases.ts          ← regex scanner (layer 3 of safety)
│   └── rate-limit.ts
├── data/
│   ├── citations.json             ← seed studies (PMID-verified)
│   └── test-inputs.json           ← 7 scenarios + synthetic banned-phrase tests
└── scripts/
    └── test-prompts.ts            ← runs against `npm run dev` server
```

## Three-layer safety

Every output passes through three checks before reaching the user:

1. **System prompt rules** (`lib/prompts.ts`) — explicit BANNED/REQUIRED pairs
   for second-person language, percentages without population qualifiers, body
   prediction, medical advice, pathologizing 140 mg/dL, Buffey 17% misuse.
2. **Zod validation** (`lib/schema.ts`) — output shape must match
   `EducationOutputSchema`.
3. **Banned-phrase scanner** (`lib/banned-phrases.ts`) — regex set runs over the
   full serialized output. Any hit → 500 + log + DO NOT serve.

Plus a **citation hallucination guard** (`lib/citations.ts`) — every
`evidence.citation_id` in the output must exist in `data/citations.json`.

## Local dev

```powershell
# 1. Install
npm install

# 2. Set up env
echo ANTHROPIC_API_KEY=sk-ant-... > .env.local

# 3. Run dev server
npm run dev          # http://localhost:3000

# 4. Run tests in another terminal
npm run test:prompts
```

## Tests

```powershell
npm run test:prompts
```

Runs in two parts:
1. **Banned-phrase scanner self-tests** — feeds synthetic strings directly to
   `scanForBannedPhrases()` (no API call). Verifies the regex set catches what
   it should and allows what it should.
2. **API integration tests** — fires 7 scenarios from `data/test-inputs.json`
   against `http://localhost:3000/api/coach`. Asserts: HTTP status, schema
   validation, citation IDs resolve, canonical headlines match, walking body
   does NOT mention "17%" or "2-minute", walking body DOES mention Reynolds or
   T2D, disclaimer ≥ 50 chars, no banned-phrase hits.

## Citations

`data/citations.json` is the single source of truth for all evidence. Every
study has a `pubmed_url` so users can verify the source. The 6 used in coach
output are PMID-verified (`verified: true`):

| ID | Study | PMID |
|---|---|---|
| `food_seq_shukla_t2d_29pct` | Shukla 2015 (T2D, 29%) | 26106234 |
| `food_seq_shukla_prediabetic_54pct` | Shukla 2019 (prediabetes, 54%) | 30101510 |
| `walking_reynolds_t2d` | Reynolds 2016 (T2D walking) | 27747394 |
| `walking_engeroff_post_vs_pre` | Engeroff 2023 (post vs pre meta) | 36715875 |
| `if_sun_umbrella` | Sun 2024 (IF umbrella) | 38500840 |
| `ifvcr_liu_2023_equivalent` | Liu 2022 NEJM (CR ± TRE) | 35443107 |

`walking_buffey_meta` is intentionally **excluded** from the coach output —
the 17% figure is from accumulated all-day breaks, not a single post-meal
walk. See `feedback_buffey_2022_distortion.md` in auto-memory.

## Deploy (Vercel)

```powershell
git init
git -c user.email="brian@metabolicmanna.com" -c user.name="Brian Schultz" add .
git -c user.email="brian@metabolicmanna.com" -c user.name="Brian Schultz" commit -m "v0: meal + move coach"
gh repo create mannaprotocol-v0 --public --source=. --push
# Vercel project link → add ANTHROPIC_API_KEY → first deploy
# Custom domain: protocol.metabolicmanna.com (CNAME to Vercel)
```

## Brand voice

Science is the evidence. Christianity is the identity. Both visible, both
plainly stated. Warm, clear, confident. Never hype, clinical, or preachy.
BSB scripture only — never NIV/ESV/NASB/NLT.

## License + attribution

This repo is private. The educational output is free to use. Citations link
to public PubMed records. The coach pipeline is "directed by hand, built with
AI."
