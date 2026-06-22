import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/session";
import { reportsService } from "@/lib/services/reports";
import { UserReportDocument } from "@/lib/pdf/UserReportDocument";

/**
 * GET /api/admin/reports/users.pdf
 *
 * Renders the user-growth report to PDF and streams it as
 * `application/pdf`. Admin-only. No CSRF (GET).
 *
 * Implementation: server-side React-PDF via `@react-pdf/renderer`.
 * Pure JS, no Chromium, no native deps — works in any Node runtime
 * that supports streaming Response bodies.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const report = await reportsService.getUserGrowthReport();
  const generatedAt = new Date();

  const buffer = await renderToBuffer(
    UserReportDocument({ report, generatedAt }),
  );

  const filename = `careerbridge-users-${generatedAt.toISOString().slice(0, 10)}.pdf`;

  // Convert Node Buffer to a Uint8Array view for the Web Response.
  // The buffer from renderToBuffer is a Node Buffer which is a
  // Uint8Array subclass, so we can pass it directly to the Response
  // constructor — Next.js will copy it to a Web ReadableStream.
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}
