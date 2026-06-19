import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * Mirrors the same dev-mode hot-reload pattern used by
 * `frontend/src/lib/prisma.ts` so that, when the backend grows into a
 * long-running process, we don't accidentally open a new pool on
 * every reload.
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
