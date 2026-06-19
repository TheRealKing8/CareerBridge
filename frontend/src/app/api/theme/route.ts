import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { THEME_COOKIE, parseDashboardTheme } from "@/lib/theme";
import { csrfOk, csrfRejectedResponse } from "@/lib/csrf";

/**
 * POST /api/theme — set the dashboard theme cookie.
 *
 * Body: { theme: "dark" | "light" }
 *
 * The cookie is used by the three dashboard layouts and by an inline
 * script in the root layout to apply `data-theme` before paint. It's
 * a preference, not a permission — no auth required.
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!csrfOk(req)) return csrfRejectedResponse();

  let body: { theme?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const theme = parseDashboardTheme(body.theme);
  const res = NextResponse.json({ ok: true, theme });
  res.cookies.set(THEME_COOKIE, theme, {
    httpOnly: false, // read by the inline script in the root layout
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}