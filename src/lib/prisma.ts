import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * Next.js dev mode hot-reload creates a fresh module instance on every
 * file save. Without a singleton, each instance opens a new SQLite
 * connection and the dev server eventually crashes with "too many
 * connections" or locks the .db file. Stash the client on `globalThis`
 * so hot reload reuses the existing handle.
 *
 * Production builds instantiate this file exactly once per worker.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}