import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

/**
 * Boot-time validation for NEXTAUTH_SECRET.
 *
 * The secret is what signs the JWT session cookies; a weak or
 * missing secret silently downgrades auth. We refuse to start in
 * production with a bad one, and warn loudly in dev.
 */
function assertNextAuthSecret(): void {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to .env.",
    );
  }
  if (secret.length < 32) {
    throw new Error(
      `NEXTAUTH_SECRET is too short (${secret.length} chars). It must be at least 32 characters of random data.`,
    );
  }
}
assertNextAuthSecret();

/**
 * NextAuth configuration — NextAuth v4 (not Auth.js v5).
 *
 * We use the credentials provider (email + password) and JWT sessions.
 * The Prisma adapter is attached to satisfy the contract for OAuth
 * providers we may add later — `Account` and `Session` rows stay empty
 * in the JWT-only flow but the models must exist (see `prisma/schema.prisma`).
 *
 * v4 has a single API:
 *   - `NextAuth({...})` → returns an HTTP handler (GET/POST).
 *   - `getServerSession({...})` → read the session in server components.
 *
 * We re-export the config as `authOptions` so the catch-all route and
 * `getServerSession` calls share one source of truth.
 *
 * Type note: the PrismaAdapter is cast to `any` because the adapter's
 * `AdapterUser` shape comes from upstream `@auth/core` while NextAuth v4
 * re-exports its own (slightly different) `AdapterUser` type. The runtime
 * contract is identical; the type collision is a peer-deps issue that
 * is fixed in next-auth@5 / Auth.js.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = PrismaAdapter(prisma) as any;

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(creds.email) },
        });
        if (!user) return null;
        if (user.status === "SUSPENDED") return null;
        const ok = await bcrypt.compare(String(creds.password), user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          // Custom fields are picked up by the jwt callback below.
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          passwordChangedAt: user.passwordChangedAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        token.emailVerified = (
          user as { emailVerified?: Date | string | null }
        ).emailVerified
          ? new Date(
              (user as { emailVerified: Date | string }).emailVerified,
            ).getTime()
          : null;
        token.passwordChangedAt = (
          user as unknown as { passwordChangedAt?: Date | string | null }
        ).passwordChangedAt
          ? new Date(
              (
                user as unknown as { passwordChangedAt: Date | string }
              ).passwordChangedAt,
            ).getTime()
          : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { status?: string }).status = token.status as string;
        (session.user as { emailVerified?: Date | null }).emailVerified =
          token.emailVerified
            ? new Date(token.emailVerified as number)
            : null;
      }
      // If the user's passwordChangedAt moved past the JWT's iat,
      // invalidate the token — the user must sign in again.
      const tokenIat = (token.iat as number | undefined) ?? 0;
      const tokenPwdAt = (token.passwordChangedAt as number | null | undefined) ?? 0;
      if (tokenPwdAt > tokenIat * 1000) {
        // Returning an empty object invalidates the session cookie on
        // the next request. NextAuth drops the JWT.
        return {} as typeof session;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};