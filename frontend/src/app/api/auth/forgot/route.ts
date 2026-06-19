import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth";
import { usersService } from "@/lib/services/users";
import { forgotPasswordSchema, flattenZodErrors } from "@/lib/validators";
import { apiError, invalidJsonResponse } from "@/lib/api-error";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";
import { clientKey, consume as consumeRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

/**
 * POST /api/auth/forgot
 *
 * Always returns the same generic success message regardless of
 * whether the email is on file, so this endpoint can't be used to
 * enumerate accounts.
 *
 * Rate-limited: 5 attempts / 10 min per IP.
 * CSRF-protected.
 */
export const runtime = "nodejs";

const RATE = { capacity: 5, refillPerWindow: 5, windowMs: 10 * 60 * 1000 };
const GENERIC =
  "If an account exists for that email, we just sent a password-reset link. Check your inbox.";

export async function POST(req: Request) {
  if (!csrfOk(req)) return csrfRejectedResponse();

  const limit = consumeRateLimit(`forgot:${clientKey(req)}`, RATE);
  if (!limit.ok) return apiError(429, "Too many requests. Try again later.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return invalidJsonResponse();
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "Validation failed.", flattenZodErrors(parsed.error));
  }
  const { email } = parsed.data;

  const user = await usersService.findByEmail(email);
  if (!user) {
    // Don't reveal non-existence. Still 200.
    return NextResponse.json({ ok: true, message: GENERIC });
  }

  const rawToken = await authService.issuePasswordResetToken(email);
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const isDev = process.env.NODE_ENV !== "production";
  const result = await sendPasswordResetEmail({ to: email, resetUrl, isDev });

  return NextResponse.json({
    ok: true,
    message: GENERIC,
    devUrl: result.devUrl,
  });
}