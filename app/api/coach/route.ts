import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts";
import { DayProtocolSchema, DayInputSchema, type DayInput, type DayProtocol } from "@/lib/schema";
import { checkRateLimit, pruneExpired } from "@/lib/rate-limit";
import { scanForBannedPhrases } from "@/lib/banned-phrases";
import { collectCitationIds, findDisallowedCitationIds, sanitizeSecondPersonMedical } from "@/lib/coach-guards";

// Generation + retry can span two model calls (~12s each); keep Vercel from
// killing the function mid-retry.
export const maxDuration = 60;

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

// Guard failures (schema mismatch, banned phrase, off-list citation) are
// stochastic — a fresh sample usually passes. One retry before failing
// closed cuts most user-facing 500s.
const MAX_ATTEMPTS = 2;

type AttemptFailure = { status: 500 | 502; message: string };

async function generateProtocol(
  input: DayInput,
  attempt: number
): Promise<{ ok: true; protocol: DayProtocol } | { ok: false; failure: AttemptFailure }> {
  let response;
  try {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });
  } catch (err) {
    console.error(`[coach] attempt ${attempt}: Anthropic API error:`, err);
    return { ok: false, failure: { status: 502, message: "Generation failed. Please try again." } };
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error(`[coach] attempt ${attempt}: empty response`);
    return { ok: false, failure: { status: 500, message: "Empty response from generator" } };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFences(textBlock.text));
  } catch {
    console.error(`[coach] attempt ${attempt}: non-JSON output:`, textBlock.text.slice(0, 500));
    return { ok: false, failure: { status: 500, message: "Generator returned invalid JSON" } };
  }

  const outputResult = DayProtocolSchema.safeParse(parsedJson);
  if (!outputResult.success) {
    console.error(`[coach] attempt ${attempt}: schema validation failed:`, JSON.stringify(outputResult.error.issues));
    return { ok: false, failure: { status: 500, message: "Generator output failed validation" } };
  }

  const { protocol: out, replacements } = sanitizeSecondPersonMedical(outputResult.data);
  if (replacements > 0) {
    console.warn(`[coach] attempt ${attempt}: normalized ${replacements} second-person medical phrase(s)`);
  }

  const disallowedIds = findDisallowedCitationIds(collectCitationIds(out));
  if (disallowedIds.length > 0) {
    console.error(`[coach] attempt ${attempt}: disallowed citation IDs:`, disallowedIds);
    return { ok: false, failure: { status: 500, message: "Generator referenced disallowed citations" } };
  }

  const bannedHits = scanForBannedPhrases(JSON.stringify(out));
  if (bannedHits.length > 0) {
    console.error(`[coach] attempt ${attempt}: banned-phrase scanner hit:`, bannedHits);
    return { ok: false, failure: { status: 500, message: "Generator output failed safety scan" } };
  }

  return { ok: true, protocol: out };
}

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

  let lastFailure: AttemptFailure = { status: 500, message: "Generation failed" };
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await generateProtocol(inputResult.data, attempt);
    if (result.ok) {
      return NextResponse.json(result.protocol, {
        headers: { "X-RateLimit-Remaining": String(rate.remaining), "X-RateLimit-Reset": String(rate.resetAt) },
      });
    }
    lastFailure = result.failure;
  }

  return NextResponse.json({ error: lastFailure.message }, { status: lastFailure.status });
}
