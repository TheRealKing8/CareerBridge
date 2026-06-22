import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { requireRole } from "@/lib/session";
import { usersService } from "@/lib/services/users";
import { USER_ROLES, type UserRole } from "@/lib/enums";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";

/**
 * PATCH /api/admin/users/[id] — change role or status for any user.
 * DELETE /api/admin/users/[id] — delete a non-admin user and all their data.
 *
 * Admin-only. The PATCH refuses to operate on the last admin account
 * (would lock you out of the system). DELETE refuses to delete any
 * admin (same reason).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!csrfOk(req)) return csrfRejectedResponse();
  const me = await requireRole(["ADMIN"]);
  const { id } = await params;

  let body: { role?: UserRole; status?: "ACTIVE" | "SUSPENDED" | "PENDING" };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  if (body.role && !(USER_ROLES as readonly string[]).includes(body.role)) {
    return apiError(400, "Invalid role.");
  }
  if (
    body.status &&
    !["ACTIVE", "SUSPENDED", "PENDING"].includes(body.status)
  ) {
    return apiError(400, "Invalid status.");
  }
  if (!body.role && !body.status) {
    return apiError(400, "Provide role or status.");
  }

  // Refuse to demote/suspend the last admin so the system stays reachable.
  if (id === me.id && (body.role !== "ADMIN" || body.status === "SUSPENDED")) {
    return apiError(400, "You cannot demote or suspend your own admin account.");
  }
  if (body.role !== "ADMIN" || body.status === "SUSPENDED") {
    const target = await usersService.findById(id);
    if (target?.role === "ADMIN") {
      const adminCount = await (
        await import("@/lib/prisma")
      ).prisma.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
      if (adminCount <= 1) {
        return apiError(
          400,
          "Refusing: this is the last active admin account. Promote another admin first.",
        );
      }
    }
  }

  if (body.role) await usersService.setRole(id, body.role);
  if (body.status) await usersService.setStatus(id, body.status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!csrfOk(_req)) return csrfRejectedResponse();
  const me = await requireRole(["ADMIN"]);
  const { id } = await params;

  if (id === me.id) {
    return apiError(400, "You cannot delete your own account.");
  }

  const result = await usersService.delete(id);
  if (!result.deleted) {
    if (result.reason === "not_found") return apiError(404, "User not found.");
    if (result.reason === "is_admin")
      return apiError(400, "Refusing to delete an admin account.");
  }
  return NextResponse.json({ ok: true });
}
