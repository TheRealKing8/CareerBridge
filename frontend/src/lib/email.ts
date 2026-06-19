/**
 * Password-reset email sender.
 *
 * Strategy:
 *   - If SMTP_HOST is set, send through Nodemailer.
 *   - Otherwise (local dev with no SMTP), log the link to the server
 *     console and, in non-production, also return it in the API
 *     response so the developer can click through the flow without
 *     configuring an inbox.
 *
 * Tokens: we email the *raw* token to the user and store only its
 * SHA-256 hash in the VerificationToken table. That way a database
 * leak doesn't yield usable reset links.
 */
import { createHash, randomBytes } from "crypto";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  const hash = hashToken(raw);
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function resetExpiry(): Date {
  return new Date(Date.now() + RESET_TTL_MS);
}

/**
 * Send a password reset email. Returns the raw reset URL when running
 * in development without SMTP configured — callers can surface it in
 * the API response so the flow stays end-to-end testable locally.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  isDev,
}: {
  to: string;
  resetUrl: string;
  isDev: boolean;
}): Promise<{ delivered: boolean; devUrl?: string }> {
  return sendWithFallback({
    to,
    subject: "Reset your CareerBridge password",
    text: `We received a request to reset your CareerBridge password.\n\nClick this link to choose a new password (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n`,
    html: `<p>We received a request to reset your CareerBridge password.</p>
<p><a href="${resetUrl}">Click here to choose a new password</a> (valid for 1 hour).</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
    devLogMessage: `Password reset link for ${to}:\n  ${resetUrl}`,
    devUrl: resetUrl,
    isDev,
  });
}

export async function sendVerificationEmail({
  to,
  verifyUrl,
  isDev,
}: {
  to: string;
  verifyUrl: string;
  isDev: boolean;
}): Promise<{ delivered: boolean; devUrl?: string }> {
  return sendWithFallback({
    to,
    subject: "Verify your CareerBridge email",
    text: `Welcome to CareerBridge!\n\nPlease confirm your email by clicking the link below (valid for 24 hours):\n${verifyUrl}\n\nIf you didn't create this account, you can ignore this email.\n`,
    html: `<p>Welcome to CareerBridge!</p>
<p>Please confirm your email by <a href="${verifyUrl}">clicking here</a> (valid for 24 hours).</p>
<p>If you didn't create this account, you can ignore this email.</p>`,
    devLogMessage: `Email verification link for ${to}:\n  ${verifyUrl}`,
    devUrl: verifyUrl,
    isDev,
  });
}

/**
 * Shared SMTP-or-console helper.
 *
 * Lazy-loads nodemailer so the dep is only required when SMTP is
 * configured. Keeps the public helpers (sendPasswordResetEmail,
 * sendVerificationEmail) free of SMTP details.
 */
async function sendWithFallback(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
  devLogMessage: string;
  devUrl: string;
  isDev: boolean;
}): Promise<{ delivered: boolean; devUrl?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? "no-reply@careerbridge.local";
  const port = Number(process.env.SMTP_PORT ?? 587);

  if (!host || !user || !pass) {
    console.info(`[email] SMTP not configured. ${args.devLogMessage}`);
    return { delivered: false, devUrl: args.isDev ? args.devUrl : undefined };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });
  return { delivered: true };
}