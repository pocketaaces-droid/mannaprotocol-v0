/**
 * Smoke test for /api/coach.
 *
 * Usage:
 *   1. Start the dev server in one terminal: npm run dev
 *   2. In another:                            npm run test:prompts
 *
 * Runs the 7 input scenarios from data/test-inputs.json against the running
 * server, then runs synthetic banned-phrase strings directly against the
 * scanner. Prints pass/fail summary.
 *
 * The synthetic-phrase tests do NOT hit the API — they just verify the
 * scanner's regex set is doing what we think it is.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EducationOutputSchema } from "../lib/schema";
import { getCitation } from "../lib/citations";
import { scanForBannedPhrases } from "../lib/banned-phrases";

const ENDPOINT = process.env.TEST_ENDPOINT ?? "http://localhost:3000/api/coach";
const TEST_INPUTS_PATH =
  process.env.TEST_INPUTS_PATH ?? resolve(process.cwd(), "data/test-inputs.json");

const CANONICAL_HEADLINES = {
  sequencing: "Order matters. Up to 54% smaller peak — same food.",
  walking: "A 10-minute post-meal walk is independently linked to smaller spikes.",
  honest: "What this is, and what it isn't.",
};

interface TestCase {
  id: string;
  description: string;
  expect_status: number;
  input: Record<string, unknown>;
}

interface SyntheticPhraseCase {
  text: string;
  should_reject: boolean;
}

interface TestInputsFile {
  test_cases: TestCase[];
  banned_phrase_synthetic: SyntheticPhraseCase[];
}

async function runApiCase(tc: TestCase): Promise<{ pass: boolean; notes: string[] }> {
  const notes: string[] = [];
  let pass = true;

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tc.input),
    });
  } catch (err) {
    return {
      pass: false,
      notes: [`FETCH FAILED: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  if (res.status !== tc.expect_status) {
    pass = false;
    notes.push(`HTTP ${res.status} (expected ${tc.expect_status})`);
  }

  // Don't deep-validate non-200 cases
  if (tc.expect_status !== 200) return { pass, notes };

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { pass: false, notes: ["Response was not JSON"] };
  }

  const parsed = EducationOutputSchema.safeParse(body);
  if (!parsed.success) {
    return {
      pass: false,
      notes: [
        `SCHEMA FAIL: ${JSON.stringify(parsed.error.flatten().fieldErrors).slice(0, 300)}`,
      ],
    };
  }

  const out = parsed.data;

  // Citation IDs
  const allIds: string[] = [];
  out.pattern_read.evidence.forEach((e) => allIds.push(e.citation_id));
  out.sequencing_fix.evidence.forEach((e) => allIds.push(e.citation_id));
  out.walking_add_on.evidence.forEach((e) => allIds.push(e.citation_id));
  out.honest_expectations.evidence.forEach((e) => allIds.push(e.citation_id));
  const unknownIds = allIds.filter((id) => !getCitation(id));
  if (unknownIds.length > 0) {
    pass = false;
    notes.push(`HALLUCINATED CITATIONS: ${unknownIds.join(", ")}`);
  }

  // Canonical headlines
  if (out.sequencing_fix.headline !== CANONICAL_HEADLINES.sequencing) {
    pass = false;
    notes.push(
      `sequencing_fix.headline mismatch:\n      got: ${out.sequencing_fix.headline}\n      want: ${CANONICAL_HEADLINES.sequencing}`
    );
  }
  if (out.walking_add_on.headline !== CANONICAL_HEADLINES.walking) {
    pass = false;
    notes.push(
      `walking_add_on.headline mismatch:\n      got: ${out.walking_add_on.headline}\n      want: ${CANONICAL_HEADLINES.walking}`
    );
  }
  if (out.honest_expectations.headline !== CANONICAL_HEADLINES.honest) {
    pass = false;
    notes.push(
      `honest_expectations.headline mismatch:\n      got: ${out.honest_expectations.headline}\n      want: ${CANONICAL_HEADLINES.honest}`
    );
  }

  // Walking body content rules
  const walkBody = out.walking_add_on.body.toLowerCase();
  if (walkBody.includes("17%") || walkBody.includes("2-minute") || walkBody.includes("two minute")) {
    pass = false;
    notes.push("walking_add_on.body contains forbidden Buffey/2-minute language");
  }
  if (!walkBody.includes("reynolds") && !walkBody.includes("type 2 diabetes")) {
    pass = false;
    notes.push("walking_add_on.body does not reference Reynolds or T2D");
  }

  // Disclaimer length
  if (out.educational_disclaimer.length < 50) {
    pass = false;
    notes.push(`educational_disclaimer too short (${out.educational_disclaimer.length} chars)`);
  }

  // Banned-phrase scan over the full output
  const bannedHits = scanForBannedPhrases(JSON.stringify(out));
  if (bannedHits.length > 0) {
    pass = false;
    notes.push(
      `BANNED PHRASE: ${bannedHits.map((h) => `"${h.match}" (${h.reason})`).join("; ")}`
    );
  }

  return { pass, notes };
}

function runSyntheticCase(tc: SyntheticPhraseCase): { pass: boolean; note: string } {
  const hits = scanForBannedPhrases(tc.text);
  const rejected = hits.length > 0;
  if (rejected === tc.should_reject) {
    return { pass: true, note: "" };
  }
  return {
    pass: false,
    note: tc.should_reject
      ? `should_reject=true but scanner missed it: "${tc.text}"`
      : `should_reject=false but scanner caught: "${hits[0].match}" in "${tc.text}"`,
  };
}

async function main() {
  const raw = await readFile(TEST_INPUTS_PATH, "utf-8");
  const data: TestInputsFile = JSON.parse(raw);

  let passed = 0;
  let failed = 0;

  console.log(`\n[1/2] Banned-phrase scanner self-tests (${data.banned_phrase_synthetic.length})\n`);
  for (const tc of data.banned_phrase_synthetic) {
    const { pass, note } = runSyntheticCase(tc);
    const label = (tc.should_reject ? "REJECT" : "ALLOW ").padEnd(7);
    process.stdout.write(`  ${label} ${tc.text.slice(0, 60).padEnd(62)} `);
    if (pass) {
      console.log("OK");
      passed++;
    } else {
      console.log("FAIL");
      console.log(`    -> ${note}`);
      failed++;
    }
  }

  console.log(`\n[2/2] API integration tests (${data.test_cases.length}) against ${ENDPOINT}\n`);
  for (const tc of data.test_cases) {
    process.stdout.write(`  ${tc.id.padEnd(32)} `);
    const { pass, notes } = await runApiCase(tc);
    if (pass) {
      console.log("OK");
      passed++;
    } else {
      console.log("FAIL");
      notes.forEach((n) => console.log(`    -> ${n}`));
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
