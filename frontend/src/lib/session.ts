import { prisma } from "@/lib/prisma";
import { USER_ROLES, type UserRole } from "@/lib/enums";

/**
 * Returns the currently authenticated user (server side) or null.
 *
 * This is a temporary, no-auth version — it always returns null. It
 * will be replaced with a NextAuth-aware version (calling `auth()`)
 * in the auth step. The shape is already locked in so callers won't
 * need to change.
 */
export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // No auth wired yet — return null so public pages render as
  // signed-out. Will be replaced with:
  //   const session = await auth();
  //   if (!session?.user) return null;
  //   return session.user as CurrentUser;
  return null;
}

/**
 * Convenience guard for use in route handlers / server actions.
 * Throws a clean 401-shaped error when there is no user.
 */
export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return u;
}

export async function requireRole(allowed: readonly UserRole[]): Promise<CurrentUser> {
  const u = await requireUser();
  if (!allowed.includes(u.role)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  return u;
}

// Re-export for convenience
export { prisma, USER_ROLES };