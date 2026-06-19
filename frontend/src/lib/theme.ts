import { cookies } from "next/headers";

/**
 * Dashboard theme tokens. Public pages are always light; the three
 * dashboards (admin, employer, student/employee) flip between the two
 * values below. The user's choice is persisted in the `cb-theme` cookie
 * — server-side this is read at layout-render time, client-side a tiny
 * inline script in the root layout applies it before paint to avoid
 * a light-flash on dark-by-default dashboards.
 */
export type DashboardTheme = "dark" | "light";

export const THEME_COOKIE = "cb-theme";
export const DEFAULT_DASHBOARD_THEME: DashboardTheme = "dark";

/**
 * Read the dashboard theme cookie. Falls back to the default when the
 * cookie is unset or has an unexpected value (e.g. a tampered client).
 */
export async function getDashboardTheme(): Promise<DashboardTheme> {
  const store = await cookies();
  const raw = store.get(THEME_COOKIE)?.value;
  return raw === "light" ? "light" : "dark";
}

/**
 * Validates and returns a DashboardTheme, defaulting when invalid.
 * Server actions and the API route use this before writing the cookie.
 */
export function parseDashboardTheme(value: unknown): DashboardTheme {
  return value === "light" ? "light" : "dark";
}