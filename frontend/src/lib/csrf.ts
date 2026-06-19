import { NextResponse } from "next/server";

/**
 * CSRF guard for custom POST/PATCH/DELETE routes.
 *
 * Strategy: rely on same-origin + same-site cookies (which NextAuth
 * already configures), and reject any non-GET request whose `Origin`
 * header doesn't match `NEXTAUTH_URL`. Browsers send Origin on every
 * cross-origin request; legitimate same-origin fetches always include
 * it as well.
 *
 * Trade-offs:
 *   - Same-origin fetches from server-side code (curl, Postman) bypass
 *     this — that's fine, they're not vulnerable to CSRF.
 *   - Mobile apps that can't set Origin fall through to the
 *     same-site-cookie protection. If you later add a mobile client,
 *     add a token-based mechanism instead.
 */
export function csrfOk(req: Request): boolean {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }
  const expected = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  if (!expected) {
    // Misconfigured server — fail closed.
    return false;
  }
  const origin = req.headers.get("origin");
  if (!origin) {
    // No Origin header — server-side caller (curl, internal fetch).
    // Same-site cookie protection still applies, allow.
    return true;
  }
  return origin.replace(/\/$/, "") === expected;
}

export function csrfRejectedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Cross-origin request blocked." },
    { status: 403 },
  );
}