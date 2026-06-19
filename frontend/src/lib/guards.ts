import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

/**
 * Gate sensitive write actions behind `emailVerified`.
 *
 * Use this inside POST/PATCH/DELETE handlers — returns either a
 * typed user (the verification gate passed) or a pre-built 403
 * `NextResponse` for the caller to short-circuit with.
 */
export async function requireVerifiedUser(): Promise<
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 },
      ),
    };
  }
  if (!user.emailVerified) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Please verify your email address before doing that. Check your inbox for a verification link.",
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true, user };
}