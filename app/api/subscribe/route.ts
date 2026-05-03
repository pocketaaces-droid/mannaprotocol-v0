import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SUBSCRIBE_URL =
  process.env.SUBSCRIBE_URL ??
  "https://metabolicmanna.com/.netlify/functions/subscribe";

const SubscribeRequestSchema = z.object({
  email: z.string().email(),
  magnet: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SubscribeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        magnet: parsed.data.magnet ?? "meal-move-tracker",
      }),
    });
    const upstreamJson = await upstream.json().catch(() => ({}));
    return NextResponse.json(upstreamJson, { status: upstream.status });
  } catch (err) {
    console.error("[subscribe-proxy] upstream failed:", err);
    return NextResponse.json(
      { error: "Subscribe service unavailable" },
      { status: 502 }
    );
  }
}
