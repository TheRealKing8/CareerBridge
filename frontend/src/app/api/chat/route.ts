import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/session";
import { clientKey, consume as consumeRateLimit } from "@/lib/rate-limit";
import { buildChatContext, renderChatContext } from "@/lib/services/ai-context";

// QW8: /api/chat now requires an authenticated user and is rate-limited
// per user (60 requests per hour). The previous version was wide open.

export const runtime = "nodejs";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-oss-20b:free";

const BASE_SYSTEM_PROMPT = `You are CareerBridge AI, a friendly career advisor for students, graduates, and early-career job seekers in East Africa. Be concise (≤120 words), warm, and concrete. If the user asks about specific jobs on the platform, do not invent listings — point them to /jobs on the site. If you don't know something, say so.`;

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

const RATE = { capacity: 60, refillPerWindow: 60, windowMs: 60 * 60 * 1000 };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "Sign in to use CareerBridge AI.");

  const limit = consumeRateLimit(`chat:${user.id}:${clientKey(req)}`, RATE);
  if (!limit.ok) {
    return apiError(
      429,
      "You've reached the chat limit for now. Try again in an hour.",
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return apiError(503, "OPENROUTER_API_KEY is not set on the server.");
  }

  let parsed;
  try {
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return apiError(400, message ?? "Invalid request body.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      "X-Title": "CareerBridge",
    },
  });

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  // Build a live snapshot of platform data so the model answers with
  // current numbers and real job titles, not invented ones. We already
  // have the viewer in scope from the auth check above.
  const context = await buildChatContext(user);
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${renderChatContext(context)}`;

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        ...parsed.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      return apiError(502, "The model returned an empty response. Try again.");
    }

    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown OpenRouter error";
    return apiError(502, `OpenRouter request failed: ${message}`);
  }
}