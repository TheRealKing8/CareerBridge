import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Auth service.
 *
 * Pure data layer — every write that touches authentication state
 * (creating a user, rotating a password, minting/consuming a token)
 * goes through here. HTTP route handlers stay thin and call these
 * functions.
 *
 * Tokens (password-reset and email-verification) share the same
 * VerificationToken model in Prisma; we use the `identifier` field
 * to discriminate (`identifier = "verify:<email>"` vs
 * `identifier = email`). Storing the SHA-256 hash of the token, not
 * the raw token, so a DB leak doesn't yield usable links.
 */

const VERIFY_PREFIX = "verify:";

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export const authService = {
  /**
   * Create a new user with a hashed password. Optionally creates the
   * matching profile row (StudentProfile or EmployerProfile) in the
   * same transaction so dashboards always have a row to read.
   */
  async createUser(args: {
    email: string;
    fullName: string;
    password: string;
    role: "STUDENT" | "EMPLOYER" | "EMPLOYEE";
  }) {
    const { email, fullName, password, role } = args;
    const passwordHash = await bcrypt.hash(password, 12);
    return prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role,
        status: "ACTIVE",
        studentProfile: role === "STUDENT" ? { create: {} } : undefined,
        employerProfile:
          role === "EMPLOYER"
            ? { create: { companyName: `${fullName}'s company` } }
            : undefined,
        employeeProfile: role === "EMPLOYEE" ? { create: {} } : undefined,
      },
      select: { id: true, role: true, email: true },
    });
  },

  /**
   * Verify credentials against the DB. Returns the user row on
   * success, null otherwise. Suspended users are treated as
   * not-found.
   */
  async verifyCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    if (user.status === "SUSPENDED") return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  },

  /**
   * Issue a password-reset token. Returns the *raw* token (so the
   * caller can email it); only the hash is persisted.
   */
  async issuePasswordResetToken(email: string) {
    const { raw, hash } = generateToken();
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hash,
        expires: new Date(Date.now() + ONE_HOUR_MS),
      },
    });
    return raw;
  },

  /**
   * Consume a password-reset token and rotate the password.
   * Sets `passwordChangedAt` so existing JWTs are invalidated on
   * the next request.
   */
  async consumePasswordReset(args: {
    rawToken: string;
    newPassword: string;
  }) {
    const hash = hashToken(args.rawToken);
    const record = await prisma.verificationToken.findUnique({
      where: { token: hash },
    });
    if (!record || record.expires.getTime() < Date.now()) {
      if (record) {
        await prisma.verificationToken.delete({ where: { token: hash } });
      }
      return { ok: false as const, reason: "invalid-or-expired" };
    }
    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });
    if (!user) {
      await prisma.verificationToken.delete({ where: { token: hash } });
      return { ok: false as const, reason: "no-account" };
    }
    const passwordHash = await bcrypt.hash(args.newPassword, 12);
    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, passwordChangedAt: now },
      }),
      prisma.verificationToken.delete({ where: { token: hash } }),
    ]);
    return { ok: true as const };
  },

  /**
   * Issue an email-verification token as part of registration and
   * return the raw token (so the caller can build an email link).
   * Identifier uses a prefix so verification tokens and
   * password-reset tokens can coexist for the same email.
   */
  async issueEmailVerificationTokenAndCreate(args: {
    email: string;
    fullName: string;
    password: string;
    role: "STUDENT" | "EMPLOYER" | "EMPLOYEE";
  }): Promise<{ user: { id: string; role: string; email: string }; rawToken: string }> {
    const user = await this.createUser(args);
    const rawToken = await this.issueEmailVerificationToken(user.email);
    return { user, rawToken };
  },

  /**
   * Issue an email-verification token. Identifier uses a prefix so
   * verification tokens and password-reset tokens can coexist for
   * the same email.
   */
  async issueEmailVerificationToken(email: string) {
    const identifier = `${VERIFY_PREFIX}${email}`;
    const { raw, hash } = generateToken();
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hash,
        expires: new Date(Date.now() + ONE_DAY_MS),
      },
    });
    return raw;
  },

  /**
   * Consume an email-verification token and mark the user verified.
   */
  async consumeEmailVerification(rawToken: string) {
    const hash = hashToken(rawToken);
    const record = await prisma.verificationToken.findUnique({
      where: { token: hash },
    });
    if (!record || record.expires.getTime() < Date.now()) {
      if (record) {
        await prisma.verificationToken.delete({ where: { token: hash } });
      }
      return { ok: false as const, reason: "invalid-or-expired" };
    }
    if (!record.identifier.startsWith(VERIFY_PREFIX)) {
      return { ok: false as const, reason: "wrong-token-kind" };
    }
    const email = record.identifier.slice(VERIFY_PREFIX.length);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await prisma.verificationToken.delete({ where: { token: hash } });
      return { ok: false as const, reason: "no-account" };
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { token: hash } }),
    ]);
    return { ok: true as const, email };
  },
};