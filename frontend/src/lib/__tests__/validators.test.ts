import { describe, expect, it } from "vitest";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  flattenZodErrors,
} from "@/lib/validators";

describe("registerSchema", () => {
  const ok = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "CorrectHorse42",
    confirmPassword: "CorrectHorse42",
    role: "STUDENT" as const,
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const r = registerSchema.safeParse({ ...ok, confirmPassword: "different" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(flattenZodErrors(r.error).confirmPassword).toMatch(/do not match/i);
    }
  });

  it("rejects passwords without a digit", () => {
    const r = registerSchema.safeParse({
      ...ok,
      password: "onlylettersandchars",
      confirmPassword: "onlylettersandchars",
    });
    expect(r.success).toBe(false);
  });

  it("rejects passwords without a letter", () => {
    const r = registerSchema.safeParse({
      ...ok,
      password: "1234567890",
      confirmPassword: "1234567890",
    });
    expect(r.success).toBe(false);
  });

  it("rejects passwords shorter than 8 characters", () => {
    const r = registerSchema.safeParse({
      ...ok,
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    expect(r.success).toBe(false);
  });

  it("rejects top common passwords regardless of length", () => {
    const r = registerSchema.safeParse({
      ...ok,
      password: "password1",
      confirmPassword: "password1",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(flattenZodErrors(r.error).password).toMatch(/too common/i);
    }
  });

  it("accepts STUDENT, EMPLOYER, and EMPLOYEE roles", () => {
    expect(registerSchema.safeParse({ ...ok, role: "STUDENT" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...ok, role: "EMPLOYER" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...ok, role: "EMPLOYEE" }).success).toBe(true);
  });

  it("rejects ADMIN role", () => {
    expect(registerSchema.safeParse({ ...ok, role: "ADMIN" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
  });
  it("rejects a non-email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const ok = {
    token: "abc",
    newPassword: "CorrectHorse42",
    confirmNewPassword: "CorrectHorse42",
  };

  it("accepts a valid reset", () => {
    expect(resetPasswordSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects mismatched confirm", () => {
    expect(
      resetPasswordSchema.safeParse({ ...ok, confirmNewPassword: "X" }).success,
    ).toBe(false);
  });

  it("rejects an empty token", () => {
    expect(resetPasswordSchema.safeParse({ ...ok, token: "" }).success).toBe(false);
  });

  it("rejects a common password", () => {
    const r = resetPasswordSchema.safeParse({
      ...ok,
      newPassword: "qwerty1234",
      confirmNewPassword: "qwerty1234",
    });
    expect(r.success).toBe(false);
  });
});

describe("flattenZodErrors", () => {
  it("returns the first message per field", () => {
    const r = registerSchema.safeParse({
      fullName: "x",
      email: "nope",
      password: "no",
      confirmPassword: "no",
      role: "STUDENT",
    });
    if (r.success) throw new Error("expected failure");
    const flat = flattenZodErrors(r.error);
    expect(flat.fullName).toBeDefined();
    expect(flat.email).toBeDefined();
    expect(flat.password).toBeDefined();
  });
});