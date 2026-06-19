// NextAuth catch-all route. `NextAuth(authOptions)` returns a single
// HTTP handler that responds to both GET and POST. This file must live
// at `app/api/auth/[...nextauth]/route.ts` so that `/api/auth/signin`,
// `/api/auth/callback/...`, `/api/auth/session`, etc. are all handled
// by the same NextAuth instance.
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };