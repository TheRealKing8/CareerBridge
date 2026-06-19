import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth";
import { resetPasswordSchema, flattenZodErrors } from "@/lib/validators";
import { apiError, invalidJsonResponse } from "@/lib/api-error";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";
import { clientKey, consume as consumeRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/auth/reset
 *
 * Consumes a one-time reset token, rotates the password, and stamps
 * `passwordChangedAt` so existing JWTs are invalidated on the next
 * request (see `lib/auth.ts` jwt/session callbacks).
 *
 * Rate-limited + CSRF-protected like the rest of the auth endpoints.
 */
export const runtime = "nodejs";

const RATE = { capacity: 5, refillPerWindow: 5, windowMs: 10 * 60 * 1000 };

export async function POST(req: Request) {
  if (!csrfOk(req)) return csrfRejectedResponse();

  const limit = consumeRateLimit(`reset:${clientKey(req)}`, RATE);
  if (!limit.ok) return apiError(429, "Too many requests. Try again later.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return invalidJsonResponse();
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "Validation failed.", flattenZodErrors(parsed.error));
  }
  const { token, newPassword } = parsed.data;

  const result = await authService.consumePasswordReset({
    rawToken: token,
    newPassword,
  });
  if (!result.ok) {
    if (result.reason === "invalid-or-expired") {
      return apiError(
        400,
        "This reset link is invalid or has expired. Please request a new one.",
      );
    }
    if (result.reason === "no-account") {
      return apiError(
        400,
        "No account is associated with this reset link.",
      );
    }
    return apiError(400, "Could not reset password.");
  }

  return NextResponse.json({ ok: true });
}