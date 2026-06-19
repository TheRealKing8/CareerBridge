import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth";
import { usersService } from "@/lib/services/users";
import { registerSchema, flattenZodErrors } from "@/lib/validators";
import { apiError, invalidJsonResponse } from "@/lib/api-error";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";
import { clientKey, consume as consumeRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

/**
 * POST /api/register
 *
 * Rate-limited: 5 attempts / 10 min per IP.
 * CSRF-protected: rejects cross-origin requests via Origin header.
 *
 * Creates a user (and matching profile), issues an email-verification
 * token, and emails the link. If SMTP is not configured (local dev)
 * the dev URL is surfaced in the response so the flow stays
 * end-to-end testable.
 *
 * Returns `{ ok: true, userId, role, devVerifyUrl? }`. The client
 * then calls `signIn("credentials", ...)` to establish the session.
 */
export const runtime = "nodejs";

const RATE = { capacity: 5, refillPerWindow: 5, windowMs: 10 * 60 * 1000 };

export async function POST(req: Request) {
  if (!csrfOk(req)) return csrfRejectedResponse();

  const limit = consumeRateLimit(`register:${clientKey(req)}`, RATE);
  if (!limit.ok) {
    return apiError(429, "Too many requests. Try again later.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return invalidJsonResponse();
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "Validation failed.", flattenZodErrors(parsed.error));
  }
  const { fullName, email, password, role } = parsed.data;

  const existing = await usersService.findByEmail(email);
  if (existing) {
    return apiError(400, "An account with that email already exists.");
  }

  const { user, rawToken } = await authService.issueEmailVerificationTokenAndCreate({
    fullName,
    email,
    password,
    role,
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify?token=${encodeURIComponent(rawToken)}`;
  const isDev = process.env.NODE_ENV !== "production";
  const sent = await sendVerificationEmail({ to: email, verifyUrl, isDev });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    role: user.role,
    devVerifyUrl: sent.devUrl,
  });
}