import { NextResponse } from "next/server";

/**
 * Standardised API error response shape.
 *
 * Every route handler in the app returns JSON of the form:
 *   { error: string, fieldErrors?: Record<string, string> }
 *
 * `apiError` is the only way to produce one of those — keeps the
 * shape consistent and stops "I forgot to include fieldErrors" bugs.
 */
export function apiError(
  status: number,
  error: string,
  fieldErrors?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    fieldErrors ? { error, fieldErrors } : { error },
    { status },
  );
}

/**
 * Helper to coerce the error from a `try { await req.json() } catch`
 * into the standard "Invalid JSON body." message.
 */
export function invalidJsonResponse(): NextResponse {
  return apiError(400, "Invalid JSON body.");
}