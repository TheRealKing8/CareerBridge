/**
 * Validated environment configuration.
 *
 * Centralises every env var the backend reads so:
 *   - We fail loudly on startup if something required is missing.
 *   - The rest of the code imports `env` (typed) instead of poking
 *     `process.env` directly.
 *
 * This module is intentionally minimal — add fields here as the
 * service grows.
 */

function read(key: string, fallback?: string): string {
  const v = process.env[key];
  if (v && v.length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(
    `Missing required environment variable: ${key}. See backend/.env.example.`,
  );
}

export const env = {
  port: Number(read("PORT", "4000")),
  databaseUrl: read("DATABASE_URL"),
  nextAuthSecret: read("NEXTAUTH_SECRET"),
  nextAuthUrl: read("NEXTAUTH_URL", "http://localhost:3000"),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

export type Env = typeof env;
