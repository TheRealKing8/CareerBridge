import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge proxy (Next.js 16; formerly "middleware") that gates the three
 * role-specific areas.
 *
 *   /admin/*       → ADMIN
 *   /employer/*    → EMPLOYER
 *   /dashboard/*   → STUDENT | EMPLOYEE
 *
 * - If unauthenticated: redirect to /login?next=<original path>.
 * - If wrong role:    redirect to the user's own dashboard.
 * - Otherwise:        pass through.
 *
 * Uses NextAuth's `getToken` (the Edge-compatible JWT reader). The
 * `NEXTAUTH_SECRET` env var is exposed to the edge automatically by
 * Next.js via `process.env`.
 *
 * The per-page `requireRole()` call in each layout is a defense-in-depth
 * check — the proxy is the primary gate.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let requiredRoles: string[] | null = null;
  if (pathname.startsWith("/admin")) {
    requiredRoles = ["ADMIN"];
  } else if (pathname.startsWith("/employer")) {
    requiredRoles = ["EMPLOYER"];
  } else if (pathname.startsWith("/dashboard")) {
    requiredRoles = ["STUDENT", "EMPLOYEE"];
  }
  if (!requiredRoles) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!requiredRoles.includes(token.role as string)) {
    const home =
      token.role === "ADMIN"
        ? "/admin"
        : token.role === "EMPLOYER"
          ? "/employer"
          : "/dashboard";
    const url = req.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employer/:path*", "/admin/:path*"],
};
