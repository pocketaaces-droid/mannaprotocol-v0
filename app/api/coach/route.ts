import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts";
import { DayProtocolSchema, DayInputSchema } from "@/lib/schema";
import { checkRateLimit, pruneExpired } from "@/lib/rate-limit";
import { scanForBannedPhrases } from "@/lib/banned-phrases";
import { collectCitationIds, findDisallowedCitationIds } from "@/lib/coach-guards";

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

  const disallowedIds = findDisallowedCitationIds(collectCitationIds(out));
  if (disallowedIds.length > 0) {
    console.error("[coach] disallowed citation IDs:", disallowedIds);
    return NextResponse.json({ error: "Generator referenced disallowed citations", disallowedIds }, { status: 500 });
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
