import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts";
import { EducationOutputSchema, MealInputSchema } from "@/lib/schema";
import { findUnknownCitationIds } from "@/lib/citations";
import { checkRateLimit, pruneExpired } from "@/lib/rate-limit";
import { scanForBannedPhrases } from "@/lib/banned-phrases";

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-haiku-4-5-20251001";

const SUBSCRIBE_URL =
  process.env.SUBSCRIBE_URL ??
  "https://metabolicmanna.com/.netlify/functions/subscribe";

async function fireSubscribe(email: string): Promise<void> {
  try {
    await fetch(SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, magnet: "meal-move-tracker" }),
    });
  } catch (err) {
    console.error("[coach] subscribe proxy failed (non-blocking):", err);
  }
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
      {
        error: "Rate limit exceeded. Try again in an hour.",
        resetAt: rate.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rate.resetAt),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const inputResult = MealInputSchema.safeParse(body);
  if (!inputResult.success) {
    return NextResponse.json(
      { error: "Invalid input", details: inputResult.error.flatten() },
      { status: 400 }
    );
  }

  // Fire-and-forget the subscribe so the welcome email + PDF link reach the user
  // even if the LLM call later fails. Email is the lead-magnet anchor.
  void fireSubscribe(inputResult.data.email);

  let response;
  try {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildUserMessage(inputResult.data),
        },
      ],
    });
  } catch (err) {
    console.error("[coach] Anthropic API error:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { error: "Empty response from generator" },
      { status: 500 }
    );
  }
  const rawText = textBlock.text;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFences(rawText));
  } catch {
    console.error("[coach] non-JSON output:", rawText.slice(0, 500));
    return NextResponse.json(
      { error: "Generator returned invalid JSON" },
      { status: 500 }
    );
  }

  const outputResult = EducationOutputSchema.safeParse(parsedJson);
  if (!outputResult.success) {
    console.error(
      "[coach] schema validation failed:",
      outputResult.error.flatten()
    );
    return NextResponse.json(
      { error: "Generator output failed validation" },
      { status: 500 }
    );
  }

  const out = outputResult.data;

  // Citation hallucination guard
  const referencedIds: string[] = [];
  out.pattern_read.evidence.forEach((e) => referencedIds.push(e.citation_id));
  out.sequencing_fix.evidence.forEach((e) => referencedIds.push(e.citation_id));
  out.walking_add_on.evidence.forEach((e) => referencedIds.push(e.citation_id));
  out.honest_expectations.evidence.forEach((e) =>
    referencedIds.push(e.citation_id)
  );

  const unknownIds = findUnknownCitationIds(referencedIds);
  if (unknownIds.length > 0) {
    console.error("[coach] hallucinated citation IDs:", unknownIds);
    return NextResponse.json(
      { error: "Generator referenced unknown citations", unknownIds },
      { status: 500 }
    );
  }

  // Banned-phrase scan over the full serialized output
  const serialized = JSON.stringify(out);
  const bannedHits = scanForBannedPhrases(serialized);
  if (bannedHits.length > 0) {
    console.error("[coach] banned-phrase scanner hit:", bannedHits);
    return NextResponse.json(
      { error: "Generator output failed safety scan" },
      { status: 500 }
    );
  }

  return NextResponse.json(out, {
    headers: {
      "X-RateLimit-Remaining": String(rate.remaining),
      "X-RateLimit-Reset": String(rate.resetAt),
    },
  });
}
