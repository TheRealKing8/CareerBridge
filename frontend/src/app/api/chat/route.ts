import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// TODO(phase-3): add per-user rate limiting once auth lands.
// Today the route is open; anyone can hit it. Acceptable while we don't
// have a user model and the deployment is local.

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are CareerBridge AI, a friendly career advisor for students, graduates, and early-career job seekers in East Africa. Be concise (≤120 words), warm, and concrete. If the user asks about specific jobs on the platform, do not invent listings — point them to /jobs on the site. If you don't know something, say so.`;

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 503 },
    );
  }

  let parsed;
  try {
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        // The client owns history — never trust a `system` role from the wire.
        ...parsed.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      return NextResponse.json(
        { error: "The model returned an empty response. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown OpenAI error";
    return NextResponse.json({ error: `OpenAI request failed: ${message}` }, { status: 502 });
  }
}
