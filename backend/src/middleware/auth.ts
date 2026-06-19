/**
 * Auth middleware stub.
 *
 * Placeholder for the future JWT verification middleware. When the
 * backend service grows, this will:
 *   1. Extract the session token from the request (cookie or header).
 *   2. Verify it against `NEXTAUTH_SECRET`.
 *   3. Attach the decoded user to the request context.
 *
 * Keep this file empty of business logic — it's just a marker for
 * where the middleware will live.
 */

export type AuthContext = {
  userId: string;
  role: "STUDENT" | "EMPLOYER" | "ADMIN";
};

export async function verifyAuth(
  _headers: Headers,
): Promise<AuthContext | null> {
  // TODO: implement JWT verification once the backend service starts
  // exposing its own endpoints.
  return null;
}
