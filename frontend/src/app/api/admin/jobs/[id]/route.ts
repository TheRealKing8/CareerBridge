import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { jobsService } from "@/lib/services/jobs";
import { apiError, invalidJsonResponse } from "@/lib/api-error";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";

/**
 * PATCH /api/admin/jobs/[id]
 *   body: { action: "approve" | "close" | "reopen" }
 *
 * DELETE /api/admin/jobs/[id]
 *   hard delete (cascades to applications via the Prisma schema).
 *
 * Admin-only. CSRF-protected.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!csrfOk(req)) return csrfRejectedResponse();
  await requireRole(["ADMIN"]);
  const { id } = await params;

  let body: { action?: "approve" | "close" | "reopen" };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return invalidJsonResponse();
  }

  if (!body.action) return apiError(400, "Missing action.");

  const result = await jobsService.transitionStatus(id, body.action);
  if (!result.ok) return apiError(400, result.error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!csrfOk(_req)) return csrfRejectedResponse();
  await requireRole(["ADMIN"]);
  const { id } = await params;
  await jobsService.delete(id);
  return NextResponse.json({ ok: true });
}