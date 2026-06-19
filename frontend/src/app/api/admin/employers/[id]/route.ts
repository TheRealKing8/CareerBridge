import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { requireRole } from "@/lib/session";
import { employersService } from "@/lib/services/employers";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";

/**
 * PATCH /api/admin/employers/[id]
 *
 * Body: { verified?: boolean, status?: "ACTIVE" | "SUSPENDED" }
 *
 * Admin-only via `requireRole(["ADMIN"])`. Delegates the data work to
 * `employersService.moderate`. CSRF-protected.
 */
export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!csrfOk(req)) return csrfRejectedResponse();
  await requireRole(["ADMIN"]);
  const { id } = await params;

  let body: { verified?: boolean; status?: "ACTIVE" | "SUSPENDED" };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const result = await employersService.moderate(id, body);
  if (!result) return apiError(404, "Employer not found.");

  return NextResponse.json({ ok: true });
}