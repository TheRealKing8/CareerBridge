import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { NextAuthOptions } from "next-auth";
import type { UserRole } from "@/lib/enums";
import { authOptions } from "@/lib/auth";

/**
 * The shape of "the currently signed-in user" across the app.
 *
 *   - Server components / route handlers: use `getCurrentUser()`.
 *   - Need a non-null user:               use `requireUser()` (redirects to /login).
 *   - Need a specific role:               use `requireRole([...allowed])`.
 *
 * The `getCurrentUser()` shape is locked in — call sites in the public
 * pages (`SiteHeader`, `/jobs/[id]`) already depend on it. Don't rename
 * fields without updating those callers.
 */
export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
  emailVerified: Date | null;
};

/**
 * Server-side session reader. Uses NextAuth v4's `getServerSession`
 * with the shared `authOptions` (same instance as the API route).
 *
 * Returns `null` for signed-out visitors so public pages render as
 * logged-out without throwing.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user?.email) return null;
  const u = session.user as {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    emailVerified?: Date | string | null;
  };
  const ev = u.emailVerified;
  return {
    id: u.id,
    email: u.email,
    fullName: u.name ?? "",
    role: u.role as UserRole,
    status: u.status,
    emailVerified: ev ? new Date(ev as string) : null,
  };
}

/**
 * Server-component guard. Redirects to /login (with a `?next=` hint)
 * if the user is not authenticated.
 */
export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

/**
 * Server-component role guard. Calls `requireUser()` first, then
 * redirects to the user's own dashboard if their role isn't allowed.
 *
 * The proxy (Next.js 16; formerly "middleware") is the primary gate;
 * this is defense-in-depth.
 */
export async function requireRole(
  allowed: readonly UserRole[],
): Promise<CurrentUser> {
  const u = await requireUser();
  if (!allowed.includes(u.role)) {
    const home =
      u.role === "ADMIN"
        ? "/admin"
        : u.role === "EMPLOYER"
          ? "/employer"
          : "/dashboard";
    redirect(home);
  }
  return u;
}