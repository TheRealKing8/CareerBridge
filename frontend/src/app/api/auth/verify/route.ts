import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth";
import { apiError } from "@/lib/api-error";
import { sendVerificationEmail } from "@/lib/email";

/**
 * GET /api/auth/verify?token=…
 *
 * One-tap email verification. Marks `User.emailVerified = now()`,
 * redirects to `/login?verified=1` on success.
 *
 * If the token is missing/invalid we still redirect, but to
 * `/login?verified=0` — generic enough that an attacker can't
 * enumerate which tokens are valid.
 */
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?verified=0", req.url));
  }

  const result = await authService.consumeEmailVerification(token);
  if (!result.ok) {
    // We could re-send here, but to keep the surface small just
    // redirect to /login with a flag and let the user request a new
    // link from their dashboard.
    return NextResponse.redirect(new URL("/login?verified=0", req.url));
  }

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}

/**
 * POST /api/auth/verify — resend a verification email.
 *
 * Authenticated users only. Reads their email from the session.
 */
export async function POST() {
  const { getCurrentUser } = await import("@/lib/session");
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  const rawToken = await authService.issueEmailVerificationToken(user.email);
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify?token=${encodeURIComponent(rawToken)}`;
  const isDev = process.env.NODE_ENV !== "production";
  const sent = await sendVerificationEmail({
    to: user.email,
    verifyUrl,
    isDev,
  });
  return NextResponse.json({ ok: true, devUrl: sent.devUrl });
}